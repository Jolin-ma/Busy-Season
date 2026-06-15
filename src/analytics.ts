import geoip from 'geoip-lite';
import { incrementScanCount, writeScanLog } from './db';
import { broadcastScan } from './wsHub';

export interface ScanEvent {
  shortId:    string;
  profileId?: string;
  timestamp:  string;
  userAgent?: string;
  ip?:        string;
}

export interface EnrichedScanEvent extends ScanEvent {
  city?:      string;
  region?:    string;
  country?:   string;
  latitude?:  number;
  longitude?: number;
}

function enrichWithGeo(ip: string | undefined): Pick<EnrichedScanEvent, 'city' | 'region' | 'country' | 'latitude' | 'longitude'> {
  if (!ip) return {};
  // Strip IPv6-mapped IPv4 prefix so geoip-lite can parse it
  const clean = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  const geo = geoip.lookup(clean);
  if (!geo) return {};
  return {
    city:      geo.city     || undefined,
    region:    geo.region   || undefined,
    country:   geo.country  || undefined,
    latitude:  geo.ll[0]    ?? undefined,
    longitude: geo.ll[1]    ?? undefined,
  };
}

// Fire-and-forget: not awaited by the router so the redirect dispatches
// before any I/O.  In production, publish to a queue (SQS/Kafka/Pub/Sub)
// for async enrichment.
export function recordScanAsync(event: ScanEvent): void {
  setImmediate(async () => {
    try {
      await incrementScanCount(event.shortId);

      const geo = enrichWithGeo(event.ip);
      const enriched: EnrichedScanEvent = { ...event, ...geo };

      if (event.profileId) {
        await writeScanLog({
          profileId:  event.profileId,
          ip:         event.ip,
          userAgent:  event.userAgent,
          ...geo,
        });
      }

      broadcastScan(enriched);
      console.log('[scan]', JSON.stringify(enriched));
    } catch (err) {
      console.error('[scan] failed to record:', err);
    }
  });
}
