import { NextRequest, NextResponse } from 'next/server';

// Proxy to the Fastify QR engine so the browser never hits a cross-origin request.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  try {
    const upstream = await fetch(`http://localhost:3000/admin/qr/${shortId}`, { cache: 'no-store' });
    if (!upstream.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const svg = await upstream.text();
    return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
  } catch {
    return NextResponse.json({ error: 'QR engine unreachable' }, { status: 502 });
  }
}
