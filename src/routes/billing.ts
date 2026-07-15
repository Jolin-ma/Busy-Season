import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { rawPrisma } from '../lib/db';
import { requireOpsKey } from '../lib/opsAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder');

// 5-minute duplicate-detection window
const DUP_WINDOW_MS = 5 * 60 * 1000;

export async function billingRoutes(fastify: FastifyInstance) {

  // Scoped to this plugin: parse JSON bodies but keep the raw bytes on
  // req.rawBody — Stripe signature verification needs the exact raw payload,
  // and Fastify's default parser discards it.
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body: Buffer, done) => {
    (req as unknown as { rawBody: Buffer }).rawBody = body;
    try {
      done(null, body.length ? JSON.parse(body.toString('utf8')) : {});
    } catch (err) {
      (err as { statusCode?: number }).statusCode = 400;
      done(err as Error, undefined);
    }
  });

  // ── GET /ops/billing/accounts ─────────────────────────────────────────────
  // Returns all users with their transaction summary for the billing panel list.
  fastify.get('/ops/billing/accounts', { preHandler: requireOpsKey }, async (_req, reply) => {
    const users = await rawPrisma.user.findMany({
      where: { profiles: { some: { deleted_at: null } } },
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

    return reply.send({ accounts: users.filter(u => u.profiles.length > 0).map(u => ({
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
  fastify.get<{ Params: { userId: string } }>('/ops/billing/account/:userId', { preHandler: requireOpsKey }, async (req, reply) => {
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
            select:  { id: true, plan: true, short_id: true, full_name: true, is_qr_active: true, is_private: true },
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
        profiles:         user.profiles.map(p => ({ shortId: p.short_id, fullName: p.full_name, isQrActive: p.is_qr_active, isPrivate: p.is_private })),
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

  // ── POST /admin/billing/switch-to-lifetime ────────────────────────────────
  // Converts a monthly subscriber to a one-time lifetime payment.
  // Only permitted within the first 3 paid months (90-day window).
  fastify.post<{ Body: { userId: string } }>('/admin/billing/switch-to-lifetime', { preHandler: requireOpsKey }, async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    const { userId } = req.body;

    const paidCount = await rawPrisma.transaction.count({
      where: { user_id: userId, status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } },
    });

    if (paidCount > 3) {
      return reply.code(403).send({
        error: 'One-time payment upgrade is only available within the first 3 months of your subscription.',
      });
    }

    // Upgrade all active profiles to PREMIUM (lifetime).
    // The Stripe $199 charge is handled client-side via Payment Intent before calling this route.
    await rawPrisma.profile.updateMany({
      where: { user_id: userId, deleted_at: null },
      data:  { plan: 'PREMIUM' },
    });

    return reply.send({ success: true });
  });

  // ── POST /admin/billing/refund ────────────────────────────────────────────
  // Issues a full or partial refund via Stripe and mirrors the result locally.
  fastify.post<{
    Body: { transactionId: string; reason?: string; amountCents?: number }
  }>('/admin/billing/refund', { preHandler: requireOpsKey }, async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    const { transactionId, reason = 'duplicate', amountCents } = req.body;

    const tx = await rawPrisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx)           return reply.code(404).send({ error: 'Transaction not found.' });
    if (tx.refunded)   return reply.code(409).send({ error: 'Transaction already fully refunded.' });

    // Refunds accumulate across calls — never exceed what's left on the charge.
    const remaining     = tx.amount - tx.refunded_amount;
    const refundedCents = amountCents ?? remaining;
    if (!Number.isInteger(refundedCents) || refundedCents <= 0 || refundedCents > remaining) {
      return reply.code(400).send({ error: `Refund amount must be between 1 and ${remaining} cents.` });
    }

    try {
      const refund = await stripe.refunds.create({
        charge: transactionId,
        amount: refundedCents,
        reason: reason as 'duplicate' | 'fraudulent' | 'requested_by_customer',
      });

      const newTotal     = tx.refunded_amount + refundedCents;
      const isFullRefund = newTotal >= tx.amount;

      const updated = await rawPrisma.transaction.update({
        where: { id: transactionId },
        data:  {
          status:          isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refunded:        isFullRefund,
          refunded_amount: newTotal,
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
  fastify.post('/stripe/webhook', async (req, reply) => {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      fastify.log.error('STRIPE_WEBHOOK_SECRET is not set — rejecting webhook.');
      return reply.code(503).send({ error: 'Webhook not configured.' });
    }

    const sig     = req.headers['stripe-signature'] as string;
    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!sig || !rawBody) return reply.code(400).send({ error: 'Invalid webhook signature.' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
