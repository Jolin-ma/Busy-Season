import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// True when all required cloud env vars are present.
export const USE_CLOUD = !!(
  process.env.S3_ENTRY_BUCKET &&
  process.env.S3_DELIVERY_BUCKET &&
  process.env.CDN_BASE_URL &&
  process.env.AWS_REGION
);

const s3 = USE_CLOUD
  ? new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export interface SignedUpload {
  rawKey:      string;   // S3 entry-bucket key  e.g. raw/<uuid>.jpg
  signedUrl:   string;   // PUT here directly from the browser
  deliveryUrl: string;   // Final CDN URL after Lambda optimises  e.g. <CDN>/<uuid>.webp
}

/**
 * Issues a 5-minute presigned PUT URL for the S3 entry bucket.
 * The caller uploads the raw file straight to S3 — the API server never
 * touches the bytes.  Lambda processes the raw file and writes the optimised
 * WebP to the delivery bucket at the returned deliveryUrl.
 */
export async function presignUpload(
  filename: string,
  contentType: string,
): Promise<SignedUpload> {
  const uuid = crypto.randomUUID();
  const ext  = path.extname(filename).toLowerCase() || '.bin';
  const rawKey = `raw/${uuid}${ext}`;

  const cmd = new PutObjectCommand({
    Bucket:      process.env.S3_ENTRY_BUCKET!,
    Key:         rawKey,
    ContentType: contentType,
  });

  const signedUrl   = await getSignedUrl(s3!, cmd, { expiresIn: 300 });
  const deliveryUrl = `${process.env.CDN_BASE_URL}/${uuid}.webp`;

  return { rawKey, signedUrl, deliveryUrl };
}
