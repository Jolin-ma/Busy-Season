import { NextRequest, NextResponse } from 'next/server';
import { buildManufacturerPayload } from '@/lib/qr';

const API         = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const OPS_API_KEY = process.env.OPS_API_KEY ?? ''; // server-only; never sent to the browser

// POST /api/manufacturing — advance profiles to ENGRAVING and build manufacturer payload
// Body: { shortIds: string[] }
export async function POST(req: NextRequest) {
  try {
    const { shortIds }: { shortIds: string[] } = await req.json();
    if (!shortIds?.length)
      return NextResponse.json({ error: 'No profile IDs provided' }, { status: 400 });

    // Fetch QR SVGs from Fastify for each profile
    const withSvgs = await Promise.all(
      shortIds.map(async id => {
        const res = await fetch(`${API}/admin/qr/${id}`);
        const svg = res.ok ? await res.text() : '';
        const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legacylinkstudio.com'}/p/${id}`;
        return { id, name: id, url, svg };
      }),
    );

    // Advance each profile to ENGRAVING
    await Promise.all(
      shortIds.map(id =>
        fetch(`${API}/admin/fulfillment/${id}/status`, {
          method:  'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(OPS_API_KEY ? { 'x-ops-key': OPS_API_KEY } : {}),
          },
          body:    JSON.stringify({ status: 'ENGRAVING' }),
        }),
      ),
    );

    const payload    = buildManufacturerPayload(withSvgs);
    const updatedIds = shortIds;

    return NextResponse.json({ success: true, orderId: payload.orderId, sent: updatedIds.length, updatedIds });
  } catch (err) {
    console.error('[manufacturing] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
