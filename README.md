# Meeting Time Picker

A lightweight scheduling poll app for small groups.

- one Next.js app
- one SQLite file
- one Caddy reverse proxy
- no accounts
- optional human-friendly invite links

## What it does

- each person sees times in their own timezone
- votes are `NO`, `MAYBE`, `YES`
- results are live and ranked from real saved responses
- week two stays hidden unless needed
- invite links can lock the page to a specific person

## Poll data

Polls are defined in JSON and loaded through the seed script.

Public sample data lives in:

- [prisma/seed-data/polls.json](/Users/joon/dev/github/meeting-time-picker/prisma/seed-data/polls.json)

Private local data can live in:

- `prisma/seed-data/polls.local.json`

That file is gitignored and automatically preferred by `npm run prisma:seed`.

Invitees support an optional `isAdmin` flag.

Example:

```json
{
  "name": "Joon",
  "isAdmin": true,
  "timeZone": "America/Los_Angeles",
  "timeZoneLabel": "PDT"
}
```

If `isAdmin` is omitted, it defaults to `false`.

## Local setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Then open:

- [http://localhost:3000/poll/aca-board-meeting-picker](http://localhost:3000/poll/aca-board-meeting-picker)

## Invite links

Generate invite links with:

```bash
npm run invite:links -- --base-url https://polls.example.com
```

Current invite token behavior:

- deterministic
- human-friendly
- no punctuation
- prefixed by a readable user id derived from the name
- poll-specific

This is not strong auth. It is just a light gate to reduce casual spam or accidental edits.

If a valid invite link is used:

- the page locks to that person
- the normal picker is replaced by a fixed invite card
- saves must include a matching invite token

If the invitee has `"isAdmin": true` in the seed JSON:

- that invite link unlocks admin mode
- the picker stays available
- that person can load and edit any invitee's responses

## Deploy

See [DEPLOY.md](/Users/joon/dev/github/meeting-time-picker/DEPLOY.md).

## Main files

- Prisma schema: [prisma/schema.prisma](/Users/joon/dev/github/meeting-time-picker/prisma/schema.prisma)
- Seed script: [prisma/seed.ts](/Users/joon/dev/github/meeting-time-picker/prisma/seed.ts)
- Sample seed JSON: [prisma/seed-data/polls.json](/Users/joon/dev/github/meeting-time-picker/prisma/seed-data/polls.json)
- Invite link generator: [scripts/generate-invite-links.mjs](/Users/joon/dev/github/meeting-time-picker/scripts/generate-invite-links.mjs)
- Poll page: [src/app/poll/[slug]/page.tsx](/Users/joon/dev/github/meeting-time-picker/src/app/poll/[slug]/page.tsx)
- Participant API: [src/app/api/polls/[slug]/participant/route.ts](/Users/joon/dev/github/meeting-time-picker/src/app/api/polls/[slug]/participant/route.ts)
