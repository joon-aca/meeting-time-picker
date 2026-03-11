import { createHmac, timingSafeEqual } from "node:crypto";

function getInviteTokenSecret() {
  const secret = process.env.INVITEE_TOKEN_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

function signInvitePayload(slug: string, encodedName: string, secret: string) {
  return createHmac("sha256", secret).update(`${slug}:${encodedName}`).digest("base64url");
}

export function canUseInviteTokens() {
  return Boolean(getInviteTokenSecret());
}

export function createInviteToken(slug: string, name: string) {
  const secret = getInviteTokenSecret();

  if (!secret) {
    throw new Error("INVITEE_TOKEN_SECRET is not configured");
  }

  const encodedName = Buffer.from(name, "utf8").toString("base64url");
  const signature = signInvitePayload(slug, encodedName, secret);

  return `v1.${encodedName}.${signature}`;
}

export function verifyInviteToken(slug: string, token: string): string | null {
  const secret = getInviteTokenSecret();

  if (!secret) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") {
    return null;
  }

  const [, encodedName, providedSignature] = parts;
  const expectedSignature = signInvitePayload(slug, encodedName, secret);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    return Buffer.from(encodedName, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
