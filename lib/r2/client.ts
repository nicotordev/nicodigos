import { S3Client } from "@aws-sdk/client-s3";
import { getR2Config } from "@/lib/r2/env";

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  const config = getR2Config();
  if (!config) {
    throw new Error("R2 is not configured");
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return client;
}

export function buildR2PublicUrl(key: string): string {
  const config = getR2Config();
  if (!config) {
    throw new Error("R2 is not configured");
  }
  return `${config.publicUrl}/${key}`;
}
