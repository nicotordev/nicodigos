import { PutObjectCommand } from "@aws-sdk/client-s3";
import { buildR2PublicUrl, getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/env";

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type CategoryImageKind = "image" | "banner";

export async function uploadCategoryImageToR2(
  categoryId: string,
  kind: CategoryImageKind,
  file: File,
): Promise<string> {
  const config = getR2Config();
  if (!config) {
    throw new Error("R2_STORAGE_NOT_CONFIGURED");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const extension = ALLOWED_TYPES.get(file.type);
  if (!extension) {
    throw new Error("FILE_TYPE_NOT_ALLOWED");
  }

  const key = `categories/${categoryId}/${kind}-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return buildR2PublicUrl(key);
}
