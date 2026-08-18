import path from 'path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),

  // DIRECT_URL bypasses the Neon pooler for schema migrations — Prisma migrate
  // uses advisory locks that PgBouncer drops between statements. Falls back to
  // DATABASE_URL where the connections aren't split.
  datasource: {
    url: (process.env.DIRECT_URL ?? process.env.DATABASE_URL) as string,
  },
});
