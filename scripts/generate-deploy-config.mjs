#!/usr/bin/env node

import net from "node:net";
import path from "node:path";

function parseArgs(argv) {
  const options = {
    domain: "polls.example.com",
    appDir: process.cwd(),
    host: "127.0.0.1",
    start: 41000,
    end: 48999,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--domain" && next) {
      options.domain = next;
      index += 1;
      continue;
    }

    if (arg === "--app-dir" && next) {
      options.appDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--host" && next) {
      options.host = next;
      index += 1;
      continue;
    }

    if (arg === "--start" && next) {
      options.start = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--end" && next) {
      options.end = Number(next);
      index += 1;
      continue;
    }
  }

  return options;
}

function isPortFree(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

function shuffle(values) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

async function findFreePort(start, end, host) {
  const candidates = shuffle(Array.from({ length: end - start + 1 }, (_, offset) => start + offset));

  for (const port of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port, host)) {
      return port;
    }
  }

  throw new Error(`No free port found in range ${start}-${end}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const port = await findFreePort(options.start, options.end, options.host);
  const databasePath = path.join(options.appDir, "prisma", "prod.db");

  console.log(`Suggested free port: ${port}`);
  console.log("");
  console.log("Environment");
  console.log(`PORT=${port}`);
  console.log("NODE_ENV=production");
  console.log(`DATABASE_URL=file:${databasePath}`);
  console.log("");
  console.log("Caddy");
  console.log(`${options.domain} {`);
  console.log(`  reverse_proxy ${options.host}:${port}`);
  console.log("}");
  console.log("");
  console.log("systemd Environment lines");
  console.log('Environment="NODE_ENV=production"');
  console.log(`Environment="PORT=${port}"`);
  console.log(`Environment="DATABASE_URL=file:${databasePath}"`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
