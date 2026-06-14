import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { rawPrisma } from '../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder');

// 5-minute duplicate-detection window
const DUP_WINDOW_MS = 5 * 60 * 1000;

export async function billingRoutes(fastify: FastifyInstance) {

  // ── GET /ops/billing/accounts ─────────────────────────────────────────────
  // Returns all users with their transaction summary for the billing panel list.
  fastify.get('/ops/billing/accounts', async (_req, reply) => {
    const users = await rawPrisma.user.findMany({
      select: {
        id:                 true,
        name:               true,
        email:              true,
        stripe_customer_id: true,
        created_at:         true,
        profiles:           {
          select:  { id: true, plan: true, short_id: true },
          where:   { deleted_at: null },
        },
        transactions:       {
          select: {
            amount:           true,
            status:           true,
            is_potential_dup: true,
            refunded:         true,
            refunded_amount:  true,
            created_at:       true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return reply.send({ accounts: users.map(u => ({
      id:                 u.id,
      name:               u.name,
      email:              u.email,
      stripeCustomerId:   u.stripe_customer_id,
      profileCount:       u.profiles.length,
      plan:               u.profiles.some(p => p.plan === 'PREMIUM') ? 'PREMIUM' : 'BASIC',
      hasDuplicate:       u.transactions.some(t => t.is_potential_dup),
      totalPaidCents:     u.transactions
        .filter(t => t.status === 'PAID' || t.status === 'PARTIALLY_REFUNDED')
        .reduce((s, t) => s + t.amount - t.refunded_amount, 0),
      totalRefundedCents: u.transactions.reduce((s, t) => s + t.refunded_amount, 0),
      shortIds:           u.profiles.map(p => p.short_id),
      lastTxStatus:       u.transactions[0]?.status ?? null,
      createdAt:          u.created_at,
      lastTxAt:           u.transactions[0]?.created_at ?? null,
    })) });
  });

  // ── GET /ops/billing/account/:userId ──────────────────────────────────────
  // Full transaction ledger for a single account.
  fastify.get<{ Params: { userId: string } }>('/ops/billing/account/:userId', async (req, reply) => {
    const [user, tickets] = await Promise.all([
      rawPrisma.user.findUnique({
        where:  { id: req.params.userId },
        select: {
          id:                 true,
          name:               true,
          email:              true,
          stripe_customer_id: true,
          created_at:         true,
          profiles:           {
            where:   { deleted_at: null },
            select:  { id: true, plan: true, short_id: true },
          },
          transactions: {
            orderBy: { created_at: 'desc' },
          },
        },
      }),
      rawPrisma.supportTicket.findMany({
        where:   { user_id: req.params.userId },
        orderBy: { created_at: 'desc' },
        select:  { id: true, subject: true, status: true, priority: true, created_at: true },
      }),
    ]);
    if (!user) return reply.code(404).send({ error: 'Account not found.' });

    return reply.send({
      account: {
        id:               user.id,
        name:             user.name,
        email:            user.email,
        stripeCustomerId: user.stripe_customer_id,
        plan:             user.profiles.some(p => p.plan === 'PREMIUM') ? 'PREMIUM' : 'BASIC',
        profileCount:     user.profiles.length,
        shortIds:         user.profiles.map(p => p.short_id),
        createdAt:        user.created_at,
        transactions:     user.transactions.map(t => ({
          id:              t.id,
          amount:          t.amount,
          currency:        t.currency,
          status:          t.status,
          isPotentialDup:  t.is_potential_dup,
          stripeInvoiceId: t.stripe_invoice_id,
          refunded:        t.refunded,
          refundedAmount:  t.refunded_amount,
          refundReason:    t.refund_reason,
          createdAt:       t.created_at,
        })),
        tickets: tickets.map(t => ({
          id:          t.id,
          subject:     t.subject,
          status:      t.status,
          priority:    t.priority,
          submittedAt: t.created_at,
        })),
      },
    });
  });

  // ── POST /admin/billing/refund ────────────────────────────────────────────
  // Issues a full or partial refund via Stripe and mirrors the result locally.
  fastify.post<{
    Body: { transactionId: string; reason?: string; amountCents?: number }
  }>('/admin/billing/refund', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    const { transactionId, reason = 'duplicate', amountCents } = req.body;

    const tx = await rawPrisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx)           return reply.code(404).send({ error: 'Transaction not found.' });
    if (tx.refunded)   return reply.code(409).send({ error: 'Transaction already fully refunded.' });

    try {
      const refundParams: Parameters<typeof stripe.refunds.create>[0] = {
        charge: transactionId,
        reason: reason as 'duplicate' | 'fraudulent' | 'requested_by_customer',
      };
      if (amountCents) refundParams.amount = amountCents;

      const refund = await stripe.refunds.create(refundParams);

      const refundedCents = amountCents ?? tx.amount;
      const isFullRefund  = refundedCents >= tx.amount;

      const updated = await rawPrisma.transaction.update({
        where: { id: transactionId },
        data:  {
          status:          isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refunded:        isFullRefund,
          refunded_amount: refundedCents,
          refund_reason:   reason,
        },
      });

      return reply.send({ success: true, refundId: refund.id, transaction: updated });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stripe error';
      fastify.log.error(err);
      return reply.code(400).send({ error: msg });
    }
  });

  // ── POST /stripe/webhook ──────────────────────────────────────────────────
  // Receives Stripe events, writes Transaction rows, and flags duplicates.
  fastify.post('/stripe/webhook', {
    config: { rawBody: true },      // Fastify must expose the raw body for sig verification
  }, async (req, reply) => {
    const sig = req.headers['stripe-signature'] as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        (req as unknown as { rawBody: Buffer }).rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET ?? '',
      );
    } catch {
      return reply.code(400).send({ error: 'Invalid webhook signature.' });
    }

    if (event.type === 'charge.succeeded') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const charge = event.data.object as any;

      // Resolve our internal user from Stripe's customer ID
      const user = charge.customer
        ? await rawPrisma.user.findUnique({
            where: { stripe_customer_id: charge.customer as string },
          })
        : null;

      if (user) {
        const windowStart = new Date(Date.now() - DUP_WINDOW_MS);

        // Duplicate detection: same user + same amount within 5 minutes
        const prior = await rawPrisma.transaction.findFirst({
          where: {
            user_id:    user.id,
            amount:     charge.amount,
            created_at: { gte: windowStart },
          },
        });

        await rawPrisma.transaction.upsert({
          where:  { id: charge.id },
          update: {},
          create: {
            id:               charge.id,
            user_id:          user.id,
            amount:           charge.amount,
            currency:         charge.currency,
            status:           'PAID',
            is_potential_dup: !!prior,
            stripe_invoice_id: typeof charge.invoice === 'string' ? charge.invoice : null,
          },
        });
      }
    }

    return reply.send({ received: true });
  });
}
