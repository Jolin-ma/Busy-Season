import QRCode from 'qrcode';

/**
 * Generates a production-ready SVG QR code string for a LegacyLink short ID.
 *
 * Config rationale:
 * - errorCorrectionLevel 'H': Reed-Solomon level H recovers up to 30% data loss.
 *   Critical for outdoor plaques exposed to scratches, rain droplets, or lichen growth.
 * - margin 4: ISO/IEC 18004 mandates a minimum 4-module quiet zone on all sides.
 *   Omitting it causes scanner firmware to fail at module boundary detection.
 * - type 'svg': pure vector output — no rasterization artifacts at any physical size.
 *   Manufacturing partners (laser engraving, high-fire ceramic) can scale freely.
 * - dark '#000000' / light '#FFFFFF': maximum contrast ratio (21:1) for outdoor
 *   scanning under variable lighting — avoids gray modules that confuse camera
 *   auto-exposure in bright sunlight or deep shadow.
 */
export async function generateLegacyQR(shortId: string): Promise<string> {
  // Read lazily so the env var set in index.ts is always picked up at call time,
  // not frozen at module-load time (which happens before index.ts sets it).
  const baseUrl = process.env.QR_BASE_URL ?? 'http://localhost:3000/r';
  const targetUrl = `${baseUrl}/${shortId}`;

  const svg = await QRCode.toString(targetUrl, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return svg;
}
