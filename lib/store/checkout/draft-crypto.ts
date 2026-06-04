import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_SALT = "nicodigos-checkout-draft-v1";

function getDraftEncryptionKey(): Buffer {
  const secret =
    process.env.CHECKOUT_DRAFT_SECRET ?? process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "CHECKOUT_DRAFT_SECRET (o BETTER_AUTH_SECRET) no está configurado.",
    );
  }

  return scryptSync(secret, KEY_SALT, 32);
}

export function encryptCheckoutDraft(plaintext: string): string {
  const key = getDraftEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function decryptCheckoutDraft(encoded: string): string {
  const key = getDraftEncryptionKey();
  const buffer = Buffer.from(encoded, "base64url");

  if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Borrador de checkout inválido.");
  }

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
