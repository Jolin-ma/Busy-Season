import { incrementScanCount, appendScanEvent } from './db';

export interface ScanEvent {
  shortId:   string;
  timestamp: string;
  userAgent?: string;
  ip?:       string;
}

// Fire-and-forget: not awaited by the router so the redirect dispatches
// before any I/O. In production, publish to a queue (SQS/Kafka/Pub/Sub)
// for async enrichment — geolocation, device type, weather.
export function recordScanAsync(event: ScanEvent): void {
  setImmediate(async () => {
    try {
      await incrementScanCount(event.shortId);
      appendScanEvent(event);
      console.log('[scan]', JSON.stringify(event));
    } catch (err) {
      console.error('[scan] failed to record:', err);
    }
  });
}
