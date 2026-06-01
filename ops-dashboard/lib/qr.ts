import QRCode from 'qrcode';

// Generates a high-resolution vector SVG string for engraving/printing.
// Each SVG is ~1000×1000 units — scalable to any physical size without quality loss.
export async function generateQRSvg(profileUrl: string): Promise<string> {
  return QRCode.toString(profileUrl, {
    type:          'svg',
    width:         1000,
    margin:        4,
    color:         { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'H', // highest redundancy for physical wear
  });
}

// Bundles multiple SVGs into a minimal zip-like manifest payload.
// In production, replace with actual archiving (e.g. JSZip) before sending.
export function buildManufacturerPayload(profiles: { id: string; name: string; url: string; svg: string }[]) {
  return {
    orderId:    `LL-${Date.now()}`,
    orderDate:  new Date().toISOString(),
    itemCount:  profiles.length,
    items: profiles.map(p => ({
      profileId:    p.id,
      deceasedName: p.name,
      profileUrl:   p.url,
      qrCodeSvg:    p.svg,
      material:     'stainless_steel',
      finish:       'laser_etch',
    })),
  };
}
