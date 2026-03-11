import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/lib/prisma";
import { seedFileSchema } from "../src/lib/poll-schemas";

async function main() {
  const localSeedPath = path.join(process.cwd(), "prisma", "seed-data", "polls.local.json");
  const defaultSeedPath = path.join(process.cwd(), "prisma", "seed-data", "polls.json");
  let seedPath = defaultSeedPath;

  try {
    await access(localSeedPath);
    seedPath = localSeedPath;
  } catch {
    seedPath = defaultSeedPath;
  }

  const raw = await readFile(seedPath, "utf8");
  const polls = seedFileSchema.parse(JSON.parse(raw));

  await prisma.vote.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.invitee.deleteMany();
  await prisma.timeslot.deleteMany();
  await prisma.poll.deleteMany();

  for (const poll of polls) {
    const createdPoll = await prisma.poll.create({
      data: {
        slug: poll.slug,
        title: poll.title,
        description: poll.description,
        timezone: poll.timezone,
        createdAt: new Date(poll.createdAt),
      },
    });

    const createdTimeslots = [] as { id: string; order: number }[];

    for (const [index, timeslot] of poll.timeslots.entries()) {
      const createdTimeslot = await prisma.timeslot.create({
        data: {
          pollId: createdPoll.id,
          date: timeslot.date,
          startTime: timeslot.startTime,
          endTime: timeslot.endTime,
          order: index,
        },
      });

      createdTimeslots.push({ id: createdTimeslot.id, order: index });
    }

    if (poll.invitees.length > 0) {
      await prisma.invitee.createMany({
        data: poll.invitees.map((invitee) => ({
          pollId: createdPoll.id,
          name: invitee.name,
          isAdmin: invitee.isAdmin,
          timeZone: invitee.timeZone,
          timeZoneLabel: invitee.timeZoneLabel,
          email: invitee.email ?? null,
          note: invitee.note ?? null,
        })),
      });
    }

    for (const participant of poll.participants) {
      const createdParticipant = await prisma.participant.create({
        data: {
          pollId: createdPoll.id,
          name: participant.name,
          submittedAt: new Date(participant.submittedAt),
        },
      });

      await prisma.vote.createMany({
        data: participant.votes.map((vote) => {
          const timeslot = createdTimeslots[vote.slotOrder];

          if (!timeslot) {
            throw new Error(`Invalid seed slot order ${vote.slotOrder} for participant ${participant.name}`);
          }

          return {
            participantId: createdParticipant.id,
            timeslotId: timeslot.id,
            value: vote.value,
          };
        }),
      });
    }
  }

  console.log(`Seeded ${polls.length} poll from ${path.basename(seedPath)}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
