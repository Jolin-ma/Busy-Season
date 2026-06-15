import path from 'path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),

  // DIRECT_URL bypasses PgBouncer for schema migrations — required because
  // Prisma migrate uses advisory locks that poolers drop between statements.
  // Falls back to DATABASE_URL in environments that don't split the connections.
  datasource: {
    url: (process.env.DIRECT_URL ?? process.env.DATABASE_URL) as string,
  },
});
