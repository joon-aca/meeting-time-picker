# Meeting Time Picker

Next.js 15 scheduling poll app backed by Prisma, SQLite, Zod, and date-fns.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- Zod
- date-fns

## What is in the repo

- One sample March 2026 poll
- Public-safe sample invitees and sample responses
- Real app wiring end to end with Prisma + SQLite
- Local-first deployment path with no container requirement

## Seed data

Tracked sample data lives in [prisma/seed-data/polls.json](/Users/joon/dev/github/meeting-time-picker/prisma/seed-data/polls.json).

If you want to keep private board member names or private seed data out of git, create:

```bash
cp prisma/seed-data/polls.json prisma/seed-data/polls.local.json
```

Then edit `prisma/seed-data/polls.local.json`.

`npm run prisma:seed` will automatically prefer `polls.local.json` when it exists. That file is gitignored.

Important:

- `npm run prisma:seed` is destructive
- it deletes and recreates the poll, invitees, participants, and votes
- do not run it after real responses exist unless you intentionally want a reset

## Local setup

Run these commands exactly:

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Then open [http://localhost:3000/poll/aca-board-meeting-picker](http://localhost:3000/poll/aca-board-meeting-picker).

## Environment

Local development uses [`.env.example`](/Users/joon/dev/github/meeting-time-picker/.env.example):

```env
DATABASE_URL="file:./dev.db"
INVITEE_TOKEN_SECRET="replace-with-a-long-random-secret"
```

The Prisma datasource is configured in [prisma/schema.prisma](/Users/joon/dev/github/meeting-time-picker/prisma/schema.prisma).

## Invite links

The app supports deterministic signed invite links.

Format:

- the invitee name is encoded into the token
- the token is signed with `INVITEE_TOKEN_SECRET`
- the token is deterministic for the same `poll slug + exact invitee name + secret`

This is not login-grade auth, but it is materially better than relying on a public name dropdown.

Behavior:

- a valid invite link locks the page to that invitee
- the invitee picker is replaced with a secure invite card
- saves are rejected if the token does not match the submitted invitee name

Generate invite links with:

```bash
npm run invite:links -- --base-url https://polls.example.com
```

The script automatically prefers `prisma/seed-data/polls.local.json` when present.

## Simple server deploy behind Caddy

This app can be deployed as:

- one Node process
- one local SQLite file on disk
- one Caddy reverse proxy entry

No container is required.

### 1. Clone on the server

```bash
git clone <your-repo-url> /srv/meeting-time-picker
cd /srv/meeting-time-picker
cp .env.example .env
```

Update `.env` to point at the server database file:

```env
DATABASE_URL="file:/srv/meeting-time-picker/prisma/prod.db"
```

### 2. Install and build

```bash
npm install
npx prisma migrate deploy
npm run build
```

### 3. Seed once if you want demo/sample data

```bash
npm run prisma:seed
```

Again: this resets data. Do not use it on a live poll unless reset is intentional.

### 4. Pick a free port and generate the proxy snippet

The helper script finds a free local port and prints matching environment, Caddy, and systemd snippets:

```bash
npm run deploy:plan -- --domain polls.example.com --app-dir /srv/meeting-time-picker
```

By default it picks a random free high port from `41000-48999`.

You can also change the search range:

```bash
npm run deploy:plan -- --domain polls.example.com --app-dir /srv/meeting-time-picker --start 42000 --end 42999
```

### 5. Run the app

Example:

```bash
PORT=43173 NODE_ENV=production npm run start
```

### 6. Proxy with Caddy

Example Caddy block:

```caddy
polls.example.com {
  reverse_proxy 127.0.0.1:43173
}
```

### 7. Keep it running

Use `systemd` or `pm2`.

`systemd` is the cleaner option on a normal Linux server.

Minimal example:

```ini
[Unit]
Description=Meeting Time Picker
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/meeting-time-picker
Environment=NODE_ENV=production
Environment=PORT=43173
Environment=DATABASE_URL=file:/srv/meeting-time-picker/prisma/prod.db
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
User=www-data

[Install]
WantedBy=multi-user.target
```

## Project files

- Prisma schema: [prisma/schema.prisma](/Users/joon/dev/github/meeting-time-picker/prisma/schema.prisma)
- Seed script: [prisma/seed.ts](/Users/joon/dev/github/meeting-time-picker/prisma/seed.ts)
- Sample seed JSON: [prisma/seed-data/polls.json](/Users/joon/dev/github/meeting-time-picker/prisma/seed-data/polls.json)
- Deploy helper: [scripts/generate-deploy-config.mjs](/Users/joon/dev/github/meeting-time-picker/scripts/generate-deploy-config.mjs)
- Invite link generator: [scripts/generate-invite-links.mjs](/Users/joon/dev/github/meeting-time-picker/scripts/generate-invite-links.mjs)
- Poll page: [src/app/poll/[slug]/page.tsx](/Users/joon/dev/github/meeting-time-picker/src/app/poll/[slug]/page.tsx)
- Poll API: [src/app/api/polls/[slug]/participant/route.ts](/Users/joon/dev/github/meeting-time-picker/src/app/api/polls/[slug]/participant/route.ts)
