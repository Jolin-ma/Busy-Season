import { NextRequest, NextResponse } from 'next/server';
import { generateQRSvg } from '@/lib/qr';
import { PROFILES } from '@/lib/mock-data';

// GET /api/qr?id=<profileId> — single QR as SVG download
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const profile = PROFILES.find(p => p.id === id);
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const svg = await generateQRSvg(profile.qrCodeUrl);

  return new NextResponse(svg, {
    headers: {
      'Content-Type':        'image/svg+xml',
      'Content-Disposition': `attachment; filename="QR-${id}.svg"`,
    },
  });
}

// POST /api/qr — batch generate, returns JSON array of SVG strings
export async function POST(req: NextRequest) {
  const { profileIds }: { profileIds: string[] } = await req.json();
  if (!profileIds?.length) return NextResponse.json({ error: 'No IDs' }, { status: 400 });

  const selected = PROFILES.filter(p => profileIds.includes(p.id));

  const results = await Promise.all(
    selected.map(async p => ({
      id:   p.id,
      name: p.name,
      url:  p.qrCodeUrl,
      svg:  await generateQRSvg(p.qrCodeUrl),
    }))
  );

  return NextResponse.json({ profiles: results });
}
