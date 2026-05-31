import { PrismaClient } from '@prisma/client';
import { PrismaPg }    from '@prisma/adapter-pg';
import { Pool }        from 'pg';

// ---------------------------------------------------------------------------
// Connection pool
// DATABASE_URL must be set in .env (see .env.example).
// ---------------------------------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

const adapter   = new PrismaPg(pool);
const rawPrisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Soft-delete extension
//
// Every Profile read via `db` silently appends `deleted_at: null` to the
// where clause, so tombstoned profiles are invisible to normal queries.
//
// OPTING OUT (admin restore / hard-delete job only):
//   import { rawPrisma } from './lib/db';
//   await rawPrisma.profile.findFirst({ where: { short_id: id } });
// ---------------------------------------------------------------------------
export const db = rawPrisma.$extends({
  query: {
    profile: {
      async findFirst({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      async findFirstOrThrow({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      async findMany({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      // findUnique requires a unique-field clause; downgrade to findFirst
      // so we can append the extra deleted_at condition without a type error.
      async findUnique({ args }) {
        return rawPrisma.profile.findFirst({
          ...args,
          where: { ...args.where, deleted_at: null },
        });
      },
      async findUniqueOrThrow({ args }) {
        const result = await rawPrisma.profile.findFirst({
          ...args,
          where: { ...args.where, deleted_at: null },
        });
        if (!result) throw new Error('Profile not found or has been deleted.');
        return result;
      },
      async count({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      async aggregate({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
    },
  },
});

// Escape hatch for admin-only operations. Never import in public request handlers.
export { rawPrisma };

export type DbClient = typeof db;
