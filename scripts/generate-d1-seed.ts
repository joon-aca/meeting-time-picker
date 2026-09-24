import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedFileSchema } from "../src/lib/poll-schemas";

function option(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function sql(value: string | number | boolean | null) {
  if (value === null) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

function insert(table: string, row: Record<string, string | number | boolean | null>) {
  const columns = Object.keys(row).map((name) => `"${name}"`).join(", ");
  const values = Object.values(row).map(sql).join(", ");
  return `INSERT INTO "${table}" (${columns}) VALUES (${values});`;
}

async function main() {
  const source = option("--source");
  const output = option("--output") ?? "d1/seed.local.sql";

  if (!source) {
    throw new Error("Provide --source path/to/polls.json. This command never selects poll data implicitly.");
  }

  const polls = seedFileSchema.parse(JSON.parse(await readFile(source, "utf8")));
  const statements: string[] = [];

  for (const poll of polls) {
    const pollId = randomUUID();
    const timeslotIds = poll.timeslots.map(() => randomUUID());

    statements.push(insert("Poll", {
      id: pollId,
      slug: poll.slug,
      title: poll.title,
      description: poll.description,
      timezone: poll.timezone,
      createdAt: poll.createdAt,
    }));

    poll.timeslots.forEach((timeslot, order) => {
      statements.push(insert("Timeslot", {
        id: timeslotIds[order],
        pollId,
        date: timeslot.date,
        startTime: timeslot.startTime,
        endTime: timeslot.endTime,
        order,
      }));
    });

    for (const invitee of poll.invitees) {
      statements.push(insert("Invitee", {
        id: randomUUID(),
        pollId,
        name: invitee.name,
        isAdmin: invitee.isAdmin,
        timeZone: invitee.timeZone,
        timeZoneLabel: invitee.timeZoneLabel,
        email: invitee.email ?? null,
        note: invitee.note ?? null,
      }));
    }

    for (const participant of poll.participants) {
      const participantId = randomUUID();
      statements.push(insert("Participant", {
        id: participantId,
        pollId,
        name: participant.name,
        submittedAt: participant.submittedAt,
      }));

      for (const vote of participant.votes) {
        const timeslotId = timeslotIds[vote.slotOrder];
        if (!timeslotId) throw new Error(`Invalid slot order ${vote.slotOrder}`);
        statements.push(insert("Vote", {
          id: randomUUID(),
          participantId,
          timeslotId,
          value: vote.value,
        }));
      }
    }
  }

  await writeFile(output, `${statements.join("\n")}\n`, { flag: "wx", mode: 0o600 });
  console.log(`Wrote ${statements.length} INSERT statements to ${path.resolve(output)}.`);
  console.log("Existing polls are never replaced. Check the source and target before importing.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
