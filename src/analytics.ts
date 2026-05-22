import { incrementScanCount } from './db';

export interface ScanEvent {
  shortId: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

// Fire-and-forget: intentionally not awaited by the router so the 301 redirect
// dispatches before any I/O occurs. In production, publish to a queue
// (SQS, Kafka, Pub/Sub) for async enrichment — geolocation, weather, device type.
export function recordScanAsync(event: ScanEvent): void {
  setImmediate(() => {
    incrementScanCount(event.shortId);
    // Production: await queue.publish('legacylink.scan-events', event)
    console.log('[scan]', JSON.stringify(event));
  });
}
