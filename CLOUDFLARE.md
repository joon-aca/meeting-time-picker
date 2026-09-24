# Cloudflare Worker deployment

The app runs on Cloudflare Workers with one D1 database. The Worker currently runs at
`https://meeting-time-picker.cold-mud-a444.workers.dev`. The existing
`meeting.africacode.org` hostname still points at Lando; switch it after the new
board poll is ready.

Cloudflare resources:

- Worker: `meeting-time-picker`
- D1 database: `meeting-time-picker`
- Wrangler config: `wrangler.jsonc`
- D1 schema migrations: `d1/migrations`

## Local preview

```bash
pnpm install --frozen-lockfile
pnpm run d1:migrate:local
pnpm exec tsx scripts/generate-d1-seed.ts --source prisma/seed-data/polls.json --output d1/seed.local.sql
pnpm exec wrangler d1 execute meeting-time-picker --local --file d1/seed.local.sql
pnpm run build:worker
pnpm run preview:worker
```

The SQL generator refuses to overwrite its output. Remove or choose another local
output file if you intentionally want to generate a new seed. Do not use the sample
poll data for the real board meeting.

## Deploy

Authenticate Wrangler with the Cloudflare account that owns the database and zone.
The database ID is recorded in `wrangler.jsonc`.

```bash
pnpm install --frozen-lockfile
pnpm run d1:migrate:remote
pnpm run build:worker
pnpm run deploy:worker
```

`pnpm run deploy:worker` uploads the build already in `.open-next`. Rebuild first
after code changes. The Worker uses its D1 binding; it does not use `DATABASE_URL`
or the local SQLite file.

## Poll data

The original Lando SQLite data was imported into D1 on September 24, 2026. The
private database backup and export files are gitignored. D1 currently contains
the prior poll, including its responses.

For a new meeting, create a new JSON poll with a **new slug**. This keeps old
responses separate. The JSON format is shown in `prisma/seed-data/polls.json`.
Set `"accessMode": "SHARED"` to let anyone with one meeting link select or
add their name. The generator appends a random 128-bit suffix to the supplied
slug, then prints the final link. Keep that link private and place it in the
calendar invitation. A cookie remembers each browser's selected name for up to
one year, including future shared polls; people can use **Change** if they
share a device.
Generate an insert-only D1 SQL file, inspect it, then import it:

```bash
pnpm exec tsx scripts/generate-d1-seed.ts --source prisma/seed-data/polls.local.json --output d1/new-board.local.sql --base-url https://meeting.africacode.org
pnpm exec wrangler d1 execute meeting-time-picker --remote --file d1/new-board.local.sql
```

The generator never deletes or updates existing polls. It fails if the slug
already exists. Keep generated SQL private: it may contain names and email
addresses. Do not run `pnpm run prisma:seed` against a database with responses;
that older command deletes and recreates every poll.

The home page is a static landing page; it does not reveal the current shared
meeting link. For older invite-mode polls, invite links are generated from the
exact invitee names and poll slug:

```bash
pnpm run invite:links -- --base-url https://meeting.africacode.org
```

The invite link generator prefers `polls.local.json` when present.

## Moving the hostname

`meeting.africacode.org` currently resolves directly to Lando. Once the new poll
has been imported and checked on the `workers.dev` URL, attach
`meeting.africacode.org` as a Worker custom domain. Cloudflare will create its
DNS record and certificate. Update `wrangler.jsonc` with a `routes` entry:

```json
"routes": [{ "pattern": "meeting.africacode.org", "custom_domain": true }]
```

Then deploy again and check the poll, invite links, and vote submission on the
custom domain. The former Caddy route on Lando can be removed after cutover.

The Worker and D1 use only Free plan features. Cloudflare's Free limits still
apply; monitor Worker CPU and D1 usage after the first invitations go out.
