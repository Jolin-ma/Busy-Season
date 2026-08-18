import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// -----------------------------------------------------------------------------
// Prisma 7 driver-adapter setup, same pattern as the repo root: the connection
// string lives in the adapter, not in schema.prisma.
//
// Construction is LAZY, behind a proxy. Two reasons:
//
//  1. `next build` evaluates page modules to collect their config. If this file
//     opened a pool (or threw on a missing DATABASE_URL) at import time, the
//     build would need a live database — so CI and a fresh clone couldn't build.
//  2. The client is cached on globalThis because Next.js dev re-evaluates
//     modules on every hot reload; without it, each edit leaks another pool
//     until Neon starts refusing connections.
//
// The missing-env error therefore surfaces on the first query, in the request
// that needed it, rather than at import.
// -----------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Copy studio/.env.example to studio/.env and fill it in, ' +
        'or set it on the Vercel project.',
    );
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
    });

  const client = new PrismaClient({ adapter: new PrismaPg(pool) });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = client;
  }

  return client;
}

function resolveClient(): PrismaClient {
  return globalForPrisma.prisma ?? createPrismaClient();
}

/**
 * Behaves exactly like a PrismaClient, but nothing is constructed until the
 * first property access. Methods are bound to the real client so `this` is
 * correct — returning an unbound Prisma delegate method breaks at call time.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = resolveClient();
    const value = client[property as keyof PrismaClient];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});
