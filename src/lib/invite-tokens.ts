import { createHash, timingSafeEqual } from "node:crypto";

const CROCKFORD_BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TOKEN_SUFFIX_LENGTH = 6;
const ADMIN_INVITEE_PUBLIC_IDS = new Set(["JOON"]);

function getInviteDisplayId(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "");
}

function normalizeInviteeName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "")
    .toUpperCase();
}

function encodeCrockfordBase32(bytes: Uint8Array) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += CROCKFORD_BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += CROCKFORD_BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function getInviteTokenSuffix(slug: string, publicId: string) {
  const digest = createHash("sha256").update(`${slug}:${publicId}`).digest();
  return encodeCrockfordBase32(digest).slice(0, TOKEN_SUFFIX_LENGTH);
}

export function getInvitePublicId(name: string) {
  const publicId = normalizeInviteeName(name);

  if (!publicId) {
    throw new Error("Invitee name must contain at least one letter or number");
  }

  return publicId;
}

export function isAdminInviteeName(name: string) {
  return ADMIN_INVITEE_PUBLIC_IDS.has(getInvitePublicId(name));
}

export function createInviteToken(slug: string, name: string) {
  const publicId = getInvitePublicId(name);
  return `${publicId}${getInviteTokenSuffix(slug, publicId)}`;
}

export function verifyInviteTokenForName(slug: string, name: string, token: string) {
  const expectedToken = createInviteToken(slug, name);
  const normalizedToken = token.trim().toUpperCase();
  const expectedBuffer = Buffer.from(expectedToken);
  const providedBuffer = Buffer.from(normalizedToken);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function resolveInviteeNameFromToken(slug: string, token: string, inviteeNames: string[]) {
  const normalizedToken = token.trim().toUpperCase();

  for (const inviteeName of inviteeNames) {
    if (verifyInviteTokenForName(slug, inviteeName, normalizedToken)) {
      return inviteeName;
    }
  }

  return null;
}
