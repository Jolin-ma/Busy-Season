import os from 'os';
import { buildServer } from './router';
import { createLink } from './db';
import { generateShortId } from './shortId';

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

// Auto-detect the machine's LAN IP so QR codes work when scanned by a phone
// on the same WiFi network. Falls back to localhost for CI/server environments.
function getLanIp(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

// Only set defaults in development — production should always set these explicitly.
if (!process.env.QR_BASE_URL) {
  const lanIp = getLanIp();
  process.env.QR_BASE_URL = `http://${lanIp}:${PORT}/p`;
  process.env.PROFILE_BASE_URL = `http://${lanIp}:${PORT}/profile`;
}
console.log(`[config] QR codes will encode: ${process.env.QR_BASE_URL}/<shortId>`);

async function main() {
  const app = buildServer();

  // Seed one demo link so the server is immediately testable after `npm run dev`.
  // Remove this block before production deployment.
  const demoShortId = generateShortId();
  createLink(demoShortId, 'demo-profile-001');
  console.log(`[seed] Demo QR route: http://localhost:${PORT}/p/${demoShortId}`);
  console.log(`[seed] Demo QR SVG:   http://localhost:${PORT}/admin/qr/${demoShortId}`);
  console.log(`[seed] Demo stats:    http://localhost:${PORT}/admin/stats/${demoShortId}`);

  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
