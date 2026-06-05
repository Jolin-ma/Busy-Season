import type { WebSocket } from '@fastify/websocket';
import type { EnrichedScanEvent } from './analytics';

// Set of all active ops-dashboard WebSocket connections
const clients = new Set<WebSocket>();

export function registerClient(ws: WebSocket): void {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

export function broadcastScan(event: EnrichedScanEvent): void {
  if (clients.size === 0) return;
  const payload = JSON.stringify({ type: 'scan', data: event });
  for (const ws of clients) {
    try {
      if (ws.readyState === ws.OPEN) ws.send(payload);
    } catch {
      clients.delete(ws);
    }
  }
}
