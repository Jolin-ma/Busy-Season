import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from '@aws-sdk/client-rekognition';
import type { S3Event } from 'aws-lambda';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';

// ── Config ──────────────────────────────────────────────────────────────────
const REGION          = process.env.AWS_REGION!;
const ENTRY_BUCKET    = process.env.S3_ENTRY_BUCKET!;
const DELIVERY_BUCKET = process.env.S3_DELIVERY_BUCKET!;  // R2 via S3-compat API or plain S3
const CDN_BASE_URL    = process.env.CDN_BASE_URL!;
const WEBHOOK_URL     = process.env.WEBHOOK_URL!;          // https://api.legacylink.com/admin/upload/webhook
const REKOG_THRESHOLD = 80;                                // confidence % to flag/reject

// R2 needs a custom endpoint; fall back to native S3 if not set.
const s3 = new S3Client({
  region: REGION,
  ...(process.env.R2_ENDPOINT
    ? { endpoint: process.env.R2_ENDPOINT, forcePathStyle: true }
    : {}),
});

const entryS3    = new S3Client({ region: REGION });
const rekognition = new RekognitionClient({ region: REGION });

// ── Helpers ─────────────────────────────────────────────────────────────────

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function downloadRaw(key: string): Promise<Buffer> {
  const { Body } = await entryS3.send(
    new GetObjectCommand({ Bucket: ENTRY_BUCKET, Key: key }),
  );
  return streamToBuffer(Body as Readable);
}

async function uploadToDelivery(key: string, body: Buffer, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket:      DELIVERY_BUCKET,
      Key:         key,
      Body:        body,
      ContentType: contentType,
    }),
  );
}

async function deleteRaw(key: string) {
  await entryS3.send(
    new DeleteObjectCommand({ Bucket: ENTRY_BUCKET, Key: key }),
  );
}

// ── Image processing ─────────────────────────────────────────────────────────

async function processImage(raw: Buffer, uuid: string): Promise<{
  deliveryUrl: string;
  thumbnailUrl: string;
}> {
  const [full, thumb] = await Promise.all([
    // Full: max 1920×1080, WebP quality 82
    sharp(raw)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer(),
    // Thumbnail: 400×400 cover crop, WebP quality 75
    sharp(raw)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer(),
  ]);

  await Promise.all([
    uploadToDelivery(`${uuid}.webp`,       full,  'image/webp'),
    uploadToDelivery(`${uuid}_thumb.webp`, thumb, 'image/webp'),
  ]);

  return {
    deliveryUrl:  `${CDN_BASE_URL}/${uuid}.webp`,
    thumbnailUrl: `${CDN_BASE_URL}/${uuid}_thumb.webp`,
  };
}

// ── Video processing (extract 3 keyframes → moderate on those) ───────────────

function extractKeyframes(videoPath: string, outDir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', () => {
        const frames = fs
          .readdirSync(outDir)
          .filter(f => f.endsWith('.jpg'))
          .map(f => path.join(outDir, f))
          .sort();
        resolve(frames);
      })
      .on('error', reject)
      .screenshots({
        count:    3,
        folder:   outDir,
        filename: 'frame_%i.jpg',
      });
  });
}

async function processVideo(raw: Buffer, uuid: string): Promise<{
  deliveryUrl:  string;
  thumbnailUrl: string;
  keyframes:    Buffer[];
}> {
  const tmpDir   = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-'));
  const videoIn  = path.join(tmpDir, `input${path.extname(uuid) || '.mp4'}`);
  const framesDir = path.join(tmpDir, 'frames');
  fs.mkdirSync(framesDir);
  fs.writeFileSync(videoIn, raw);

  const framePaths = await extractKeyframes(videoIn, framesDir);
  const keyframes  = framePaths.map(p => fs.readFileSync(p));

  // Upload original video (no re-encode to keep Lambda timeout short)
  // and the first keyframe as the thumbnail WebP.
  const thumbWebp = await sharp(keyframes[0] ?? Buffer.alloc(0))
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();

  await Promise.all([
    uploadToDelivery(`${uuid}.mp4`,        raw,      'video/mp4'),
    uploadToDelivery(`${uuid}_thumb.webp`, thumbWebp, 'image/webp'),
  ]);

  fs.rmSync(tmpDir, { recursive: true, force: true });

  return {
    deliveryUrl:  `${CDN_BASE_URL}/${uuid}.mp4`,
    thumbnailUrl: `${CDN_BASE_URL}/${uuid}_thumb.webp`,
    keyframes,
  };
}

// ── Rekognition moderation ───────────────────────────────────────────────────

type ModerationStatus = 'APPROVED' | 'FLAGGED' | 'REJECTED';

const REJECT_LABELS = new Set([
  'Explicit Nudity',
  'Nudity',
  'Graphic Violence',
  'Graphic Male Nudity',
  'Graphic Female Nudity',
  'Sexual Activity',
]);

async function moderateImage(imageBuffer: Buffer): Promise<ModerationStatus> {
  const { ModerationLabels = [] } = await rekognition.send(
    new DetectModerationLabelsCommand({
      Image:          { Bytes: imageBuffer },
      MinConfidence:  50,
    }),
  );

  const highConfidence = ModerationLabels.filter(l => (l.Confidence ?? 0) >= REKOG_THRESHOLD);

  if (highConfidence.some(l => REJECT_LABELS.has(l.Name ?? ''))) return 'REJECTED';
  if (highConfidence.length > 0) return 'FLAGGED';
  return 'APPROVED';
}

// Run moderation on up to 3 images; take the worst result.
async function moderateImages(buffers: Buffer[]): Promise<ModerationStatus> {
  const results = await Promise.all(buffers.slice(0, 3).map(moderateImage));
  if (results.includes('REJECTED')) return 'REJECTED';
  if (results.includes('FLAGGED'))  return 'FLAGGED';
  return 'APPROVED';
}

// ── Webhook ──────────────────────────────────────────────────────────────────

async function notifyWebhook(payload: {
  deliveryUrl:      string;
  thumbnailUrl:     string;
  moderationStatus: ModerationStatus;
}) {
  await fetch(WEBHOOK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
}

// ── Lambda handler ───────────────────────────────────────────────────────────

export async function handler(event: S3Event) {
  for (const record of event.Records) {
    const rawKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    // Key format: raw/<uuid>.<ext>
    const basename = path.basename(rawKey);               // <uuid>.<ext>
    const uuid     = basename.replace(/\.[^.]+$/, '');    // <uuid>
    const ext      = path.extname(basename).toLowerCase();

    const isVideo = ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext);
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.tiff', '.webp'].includes(ext);

    if (!isVideo && !isImage) {
      // Audio — no visual content to moderate; mark approved and pass through.
      const raw = await downloadRaw(rawKey);
      await uploadToDelivery(`${uuid}${ext}`, raw, `audio/${ext.slice(1)}`);
      await notifyWebhook({
        deliveryUrl:      `${CDN_BASE_URL}/${uuid}${ext}`,
        thumbnailUrl:     '',
        moderationStatus: 'APPROVED',
      });
      await deleteRaw(rawKey);
      continue;
    }

    const raw = await downloadRaw(rawKey);

    let deliveryUrl:      string;
    let thumbnailUrl:     string;
    let moderationStatus: ModerationStatus;

    if (isImage) {
      ({ deliveryUrl, thumbnailUrl } = await processImage(raw, uuid));
      // Fetch the optimised WebP for moderation (smaller, faster than raw)
      const optimised = await downloadRaw(`${uuid}.webp`).catch(() => raw);
      moderationStatus = await moderateImages([optimised]);
    } else {
      // Video
      const { deliveryUrl: dUrl, thumbnailUrl: tUrl, keyframes } = await processVideo(raw, uuid);
      deliveryUrl  = dUrl;
      thumbnailUrl = tUrl;
      moderationStatus = await moderateImages(keyframes);
    }

    await notifyWebhook({ deliveryUrl, thumbnailUrl, moderationStatus });
    await deleteRaw(rawKey);
  }
}
