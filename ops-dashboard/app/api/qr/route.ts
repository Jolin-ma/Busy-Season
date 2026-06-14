import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// GET /api/qr?id=<shortId> — proxy to Fastify for a single QR SVG
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const upstream = await fetch(`${API}/admin/qr/${id}`);
  if (!upstream.ok) return NextResponse.json({ error: 'QR not found' }, { status: upstream.status });

  const svg = await upstream.text();
  return new NextResponse(svg, {
    headers: {
      'Content-Type':        'image/svg+xml',
      'Content-Disposition': `attachment; filename="QR-${id}.svg"`,
    },
  });
}

// POST /api/qr — batch generate; body: { shortIds: string[] }
export async function POST(req: NextRequest) {
  const { shortIds }: { shortIds: string[] } = await req.json();
  if (!shortIds?.length) return NextResponse.json({ error: 'No IDs' }, { status: 400 });

  const results = await Promise.all(
    shortIds.map(async id => {
      const res = await fetch(`${API}/admin/qr/${id}`);
      const svg = res.ok ? await res.text() : '';
      const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legacylinkstudio.com'}/p/${id}`;
      return { id, name: id, url, svg };
    }),
  );

  return NextResponse.json({ profiles: results });
}
