import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `pg` is a native-ish driver; keep it out of the bundler so the Prisma
  // driver adapter loads it normally at runtime on the server.
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],

  // Pin the tracing root to this directory. There are lockfiles both here and
  // at the repo root, so Next otherwise guesses which one marks the workspace
  // and warns about it — a wrong guess traces the wrong files into the
  // serverless bundle.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
