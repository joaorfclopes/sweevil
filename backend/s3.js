import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

function makeS3Client() {
  const cfg = { region: process.env.AWS_REGION || 'us-east-1', followRegionRedirects: true };
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    cfg.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  return new S3Client(cfg);
}

export const s3 = makeS3Client();

export function s3KeyFromUrl(url) {
  try {
    return new URL(url).pathname.slice(1);
  } catch {
    return null;
  }
}

export async function deleteFromS3(url) {
  const key = s3KeyFromUrl(url);
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
}

export async function deleteAllFromS3(urls = []) {
  await Promise.all(urls.map(deleteFromS3));
}
