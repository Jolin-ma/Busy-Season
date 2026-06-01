import { NextRequest, NextResponse } from 'next/server';
import { generateQRSvg, buildManufacturerPayload } from '@/lib/qr';
import { PROFILES } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  try {
    const { profileIds }: { profileIds: string[] } = await req.json();

    if (!profileIds?.length) {
      return NextResponse.json({ error: 'No profile IDs provided' }, { status: 400 });
    }

    // 1. Resolve profiles from DB (mock: filter from seed data)
    const selected = PROFILES.filter(p => profileIds.includes(p.id));
    if (!selected.length) {
      return NextResponse.json({ error: 'No matching profiles found' }, { status: 404 });
    }

    // 2. Generate a high-res vector SVG QR code for each profile URL
    const withSvgs = await Promise.all(
      selected.map(async p => ({
        id:   p.id,
        name: p.name,
        url:  p.qrCodeUrl,
        svg:  await generateQRSvg(p.qrCodeUrl),
      }))
    );

    // 3. Build the manufacturer order payload
    const payload = buildManufacturerPayload(withSvgs);

    // 4. Send to manufacturer (mock: simulate ~600ms network round-trip)
    //    In production: await fetch(process.env.MANUFACTURER_WEBHOOK_URL!, { method: 'POST', body: JSON.stringify(payload) })
    await new Promise(resolve => setTimeout(resolve, 600));

    // 5. Update DB status → IN_PRODUCTION
    //    In production: await prisma.profile.updateMany({ where: { id: { in: profileIds } }, data: { status: 'IN_PRODUCTION' } })
    //    Mock: return updated IDs so the client can update local state
    const updatedIds = selected.map(p => p.id);

    return NextResponse.json({
      success:    true,
      orderId:    payload.orderId,
      sent:       updatedIds.length,
      updatedIds,
    });
  } catch (err) {
    console.error('[manufacturing] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
