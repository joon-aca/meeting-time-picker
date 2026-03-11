#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { createHmac } from "node:crypto";
import path from "node:path";

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function loadEnvValue(name) {
  if (process.env[name]) {
    return process.env[name];
  }

  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContents = readFileSync(envPath, "utf8");
    for (const line of envContents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex < 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      if (key === name) {
        return rawValue.replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
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

function createInviteToken(slug, name, secret) {
  const encodedName = Buffer.from(name, "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(`${slug}:${encodedName}`).digest("base64url");
  return `v1.${encodedName}.${signature}`;
}

async function main() {
  const baseUrl = getArgValue("--base-url") ?? process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Provide --base-url https://polls.example.com or set BASE_URL");
  }

  const secret = loadEnvValue("INVITEE_TOKEN_SECRET");
  if (!secret) {
    throw new Error("INVITEE_TOKEN_SECRET is not configured");
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
    const token = createInviteToken(poll.slug, invitee.name, secret);
    console.log(`${invitee.name}`);
    console.log(`${normalizedBaseUrl}/poll/${poll.slug}?invite=${token}`);
    console.log("");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
