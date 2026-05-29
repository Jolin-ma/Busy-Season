import path from 'path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),

  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { Pool }     = await import('pg');

      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // Keep the pool small for the CLI — migrations are not hot-path traffic.
        max: 2,
      });

      return new PrismaPg(pool);
    },
  },
});
