# Deploy Guide

This app is intended to be simple to run:

- one Node process
- one SQLite file
- one Caddy reverse proxy
- optional tokened invite links

No container is required.

## Is This Worth It?

If this is a short-lived scheduling app, the current setup is probably enough.

Why:

- SQLite keeps operations simple
- tokened links are already implemented
- there is no separate auth system to manage
- deploy is just `git pull`, `build`, and restart

What is not worth doing for a short-term app:

- full user accounts
- password reset flows
- a separate database just for invite tokens
- multi-instance deployment

## Server Shape

Recommended layout:

- app directory: `/srv/meeting-time-picker`
- database file: `/srv/meeting-time-picker/prisma/prod.db`
- app listens on `127.0.0.1:<random-high-port>`
- Caddy reverse proxies a DNS hostname to that port

## Environment

Create `.env` on the server:

```env
DATABASE_URL="file:/srv/meeting-time-picker/prisma/prod.db"
```

Notes:

- no token secret is required for the current invite-link scheme
- invite links are lightweight gates, not strong authentication

## Initial Deploy

```bash
git clone <your-repo-url> /srv/meeting-time-picker
cd /srv/meeting-time-picker
cp .env.example .env
```

Edit `.env` for production values, then:

```bash
npm install
npx prisma migrate deploy
npm run build
```

Optional sample/demo seed:

```bash
npm run prisma:seed
```

Warning:

- `npm run prisma:seed` is destructive
- it deletes and recreates poll data
- do not run it after real responses exist unless reset is intentional

## Private Invitees

Public sample data is kept in:

- [prisma/seed-data/polls.json](/Users/joon/dev/github/meeting-time-picker/prisma/seed-data/polls.json)

Private local data can live in:

- `prisma/seed-data/polls.local.json`

That file is gitignored.

The seed command automatically prefers `polls.local.json` when it exists.

Typical flow:

```bash
cp prisma/seed-data/polls.json prisma/seed-data/polls.local.json
```

Then edit `polls.local.json` with your actual invitees.

## Pick a Port

Use the helper to choose a free high port and print matching config:

```bash
npm run deploy:plan -- --domain polls.example.com --app-dir /srv/meeting-time-picker
```

That prints:

- suggested port
- env values
- Caddy snippet
- systemd environment lines

## Start the App

Example:

```bash
PORT=43173 NODE_ENV=production npm run start
```

## Caddy

Example Caddy block:

```caddy
polls.example.com {
  reverse_proxy 127.0.0.1:43173
}
```

## systemd

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

## Invite Link Generation

Invite links are deterministic human-friendly tokens.

What that means:

- token is derived from `poll slug + exact invitee name`
- no DB token table is required
- token is short enough to be human-readable
- token is prefixed by a readable user id derived from the invitee name
- token is name-bound and checked on save

Generate links with:

```bash
npm run invite:links -- --base-url https://polls.example.com
```

The script reads:

- invitees from `polls.local.json` if present
- otherwise from `polls.json`

Output looks like:

```text
Raj
https://polls.example.com/poll/aca-board-meeting-picker?invite=Raj-V2K0P0
```

## Invite Link Behavior

When a valid token is present:

- the page locks to that invitee
- the normal name picker is replaced by a secure invite card
- saves must include a valid matching token

When a token is invalid:

- the page falls back to the picker
- save requests with that bad token are rejected

## Troubleshooting

### Invite links stopped working

Most likely causes:

- invitee name in the seed changed
- poll slug changed
- link was generated from different seed data than the server is using

Check:

```bash
npm run invite:links -- --base-url https://polls.example.com
```

If the exact invitee names or slug changed, regenerate all links.

### Token says invalid

Check:

- exact invitee name in seed file
- current poll slug
- whether the server is using `polls.local.json` or `polls.json`

Remember:

- token generation uses the exact name string
- `Timo` and `Timo ` are different

### I changed the seed but the app still shows old data

You probably changed the JSON file but did not reseed.

Run:

```bash
npm run prisma:seed
```

Again: this resets data.

### Real responses disappeared

Most likely cause:

- `npm run prisma:seed` was run after live use

SQLite recovery depends on whether you have a backup of `prod.db`.

Back up the DB file before reseeding or major changes.

### Build works but dev server throws strange manifest errors

If you see errors mentioning React Client Manifest or Next DevTools:

```bash
pkill -f "next dev" || true
rm -rf .next
npm run dev
```

Cause:

- on this repo, running `next build` while `next dev` is also active can leave stale `.next` artifacts

### The app won’t start on the chosen port

Check whether another process already bound the port:

```bash
lsof -nP -iTCP:<PORT> -sTCP:LISTEN
```

Then either:

- stop the conflicting service
- or choose another port

### The deploy port helper says no free port found

Use a different range:

```bash
npm run deploy:plan -- --domain polls.example.com --app-dir /srv/meeting-time-picker --start 42000 --end 52000
```

### API writes are being rejected

Possible causes:

- invalid invite token
- wrong `Content-Type`
- cross-origin request blocked
- payload too large
- rate limit hit

This is expected behavior from the hardening checks.

### Search engines indexed the app anyway

The app sets `noindex`, but that is advisory.

If you want stronger protection:

- keep the hostname obscure
- avoid linking it publicly
- optionally add HTTP auth at Caddy if needed

## Operational Notes

- this app is intended for one small instance, not horizontal scaling
- the in-memory rate limiter resets on restart
- SQLite is fine for low-volume use on one server
- forwarded invite links still work for the recipient of the forwarded link

For a board scheduling poll, that is usually an acceptable tradeoff.
