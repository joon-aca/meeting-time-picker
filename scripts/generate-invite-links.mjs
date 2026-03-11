#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function resolveSeedPath() {
  const localSeedPath = path.join(process.cwd(), "prisma", "seed-data", "polls.local.json");
  const defaultSeedPath = path.join(process.cwd(), "prisma", "seed-data", "polls.json");

  try {
    await access(localSeedPath);
    return localSeedPath;
  } catch {
    return defaultSeedPath;
  }
}

const CROCKFORD_BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function normalizeInviteeName(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "")
    .toUpperCase();
}

function encodeCrockfordBase32(bytes) {
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

function createInviteToken(slug, name) {
  const publicId = normalizeInviteeName(name);
  const digest = createHash("sha256").update(`${slug}:${publicId}`).digest();
  const suffix = encodeCrockfordBase32(digest).slice(0, 6);
  return `${publicId}${suffix}`;
}

async function main() {
  const baseUrl = getArgValue("--base-url") ?? process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Provide --base-url https://polls.example.com or set BASE_URL");
  }

  const seedPath = await resolveSeedPath();
  const raw = await readFile(seedPath, "utf8");
  const polls = JSON.parse(raw);
  const [poll] = polls;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (!poll?.slug || !Array.isArray(poll.invitees)) {
    throw new Error(`Unexpected seed format in ${path.basename(seedPath)}`);
  }

  console.log(`Poll: ${poll.title}`);
  console.log(`Seed source: ${path.basename(seedPath)}`);
  console.log("");

  for (const invitee of poll.invitees) {
    const token = createInviteToken(poll.slug, invitee.name);
    console.log(`${invitee.name}`);
    console.log(`${normalizedBaseUrl}/poll/${poll.slug}?invite=${token}`);
    console.log("");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
