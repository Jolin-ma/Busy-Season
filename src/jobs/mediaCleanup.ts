import { rawPrisma }                       from '../lib/db';
import { deleteStorageObject, USE_CLOUD }  from '../lib/storage';

const ENTRY_BUCKET    = process.env.S3_ENTRY_BUCKET    ?? '';
const DELIVERY_BUCKET = process.env.S3_DELIVERY_BUCKET ?? '';

export interface CleanupResult {
  stale:  number;  // PENDING_UPLOAD assets timed out (Lambda never called back)
  marked: number;  // assets cascade-marked from soft-deleted profiles this run
  purged: number;  // assets successfully deleted from S3 + DB
  errors: number;  // assets that failed S3 deletion (left in DB for next run)
}

/**
 * Single cleanup pass. Safe to call manually or on a schedule.
 *
 * Phase 1 — cascade mark: any MediaAsset whose parent Profile is soft-deleted
 *   gets marked MARKED_FOR_DELETION if it isn't already.
 *
 * Phase 2 — purge: every MARKED_FOR_DELETION asset is deleted from S3
 *   (original_key from entry bucket, processed_key from delivery bucket),
 *   then the DB row is hard-deleted. If the S3 call fails the row is left
 *   intact so the next run retries. S3 DeleteObject is idempotent — keys
 *   that don't exist return success.
 */
export async function runMediaCleanup(): Promise<CleanupResult> {
  // Phase 0: stale PENDING_UPLOAD rows — Lambda never called back (Lambda error,
  // transient network failure, or upload was abandoned after presign). S3 lifecycle
  // handles ghost files with no DB row; this handles rows that do exist.
  // 2-hour window gives the Lambda ample time to complete and call the webhook.
  const staleThreshold = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const { count: stale } = await rawPrisma.mediaAsset.updateMany({
    where: {
      upload_status: 'PENDING_UPLOAD',
      created_at:    { lt: staleThreshold },
    },
    data: { upload_status: 'MARKED_FOR_DELETION' },
  });

  // Phase 1: cascade mark from soft-deleted profiles
  const { count: marked } = await rawPrisma.mediaAsset.updateMany({
    where: {
      upload_status: { not: 'MARKED_FOR_DELETION' },
      profile:       { deleted_at: { not: null } },
    },
    data: { upload_status: 'MARKED_FOR_DELETION' },
  });

  // Phase 2: pull all marked assets and purge them
  // Fetching all at once is fine at this scale; use cursor pagination if this
  // ever grows to tens of thousands of rows per run.
  const assets = await rawPrisma.mediaAsset.findMany({
    where:  { upload_status: 'MARKED_FOR_DELETION' },
    select: { id: true, original_key: true, processed_key: true },
    orderBy: { created_at: 'asc' },
  });

  let purged = 0;
  let errors = 0;

  for (const asset of assets) {
    try {
      if (USE_CLOUD) {
        if (asset.original_key)  await deleteStorageObject(ENTRY_BUCKET,    asset.original_key);
        if (asset.processed_key) await deleteStorageObject(DELIVERY_BUCKET, asset.processed_key);
      }
      await rawPrisma.mediaAsset.delete({ where: { id: asset.id } });
      purged++;
    } catch (err) {
      // Leave the row for the next run rather than risking DB/S3 desync.
      errors++;
      console.error(`[cleanup] Failed to purge asset ${asset.id}:`, err);
    }
  }

  return { stale, marked, purged, errors };
}

/**
 * Starts the recurring cleanup schedule.
 * Runs once immediately at startup to catch anything missed while the server
 * was down, then repeats on the given interval (default: every 6 hours).
 */
export function scheduleMediaCleanup(intervalMs = 6 * 60 * 60 * 1000): void {
  const run = async () => {
    console.log('[cleanup] Media orphan cleanup starting...');
    try {
      const { stale, marked, purged, errors } = await runMediaCleanup();
      console.log(`[cleanup] Done — stale: ${stale}, marked: ${marked}, purged: ${purged}, errors: ${errors}`);
    } catch (err) {
      console.error('[cleanup] Unexpected top-level error:', err);
    }
  };

  run();
  setInterval(run, intervalMs);
}
