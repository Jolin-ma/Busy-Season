import { NextRequest, NextResponse } from 'next/server';

const API         = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
// Server-only — deliberately NOT prefixed with NEXT_PUBLIC_. This route runs
// on the Next.js server, so the key never reaches the browser bundle. It
// must match the OPS_API_KEY set on the Fastify API host (Railway).
const OPS_API_KEY = process.env.OPS_API_KEY ?? '';

// Generic authenticated proxy: browser → this route → Fastify.
// Lets ops-dashboard client components call guarded back-office routes
// (/admin/*, /ops/*) without ever holding OPS_API_KEY themselves.
// Example: fetch('/api/gw/admin/directory') → Fastify GET /admin/directory
async function forward(req: NextRequest, path: string[]): Promise<NextResponse> {
  const target = `${API}/${path.join('/')}${req.nextUrl.search}`;

  const init: RequestInit = {
    method:  req.method,
    headers: {
      'Content-Type': req.headers.get('content-type') ?? 'application/json',
      ...(OPS_API_KEY ? { 'x-ops-key': OPS_API_KEY } : {}),
    },
    cache: 'no-store',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text();
    if (body) init.body = body;
  }

  try {
    const upstream = await fetch(target, init);
    const text = await upstream.text();
    return new NextResponse(text, {
      status:  upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (err) {
    console.error('[gw proxy] upstream error:', err);
    return NextResponse.json({ error: 'API unreachable' }, { status: 502 });
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
