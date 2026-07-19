import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

let s3Client: S3Client | null = null;

export function getStorageClient(): S3Client | null {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }

  return s3Client;
}

export function isStorageConfigured(): boolean {
  return Boolean(env.S3_ENDPOINT && env.S3_ACCESS_KEY && env.S3_SECRET_KEY);
}
