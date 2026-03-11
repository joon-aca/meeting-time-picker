import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { participantPayloadSchema } from "@/lib/poll-schemas";
import { Poll, Vote } from "@/lib/poll-types";
import { isAdminInviteeName, resolveInviteeNameFromToken } from "@/lib/invite-tokens";
import { formatTimeslotLabel, getTimeZoneDisplayLabel } from "@/lib/poll-utils";

const pollInclude = {
  timeslots: {
    orderBy: {
      order: "asc",
    },
  },
  invitees: {
    orderBy: {
      name: "asc",
    },
  },
  participants: {
    orderBy: [
      {
        name: "asc",
      },
      {
        submittedAt: "asc",
      },
    ],
    include: {
      votes: true,
    },
  },
} satisfies Prisma.PollInclude;

type PollRecord = Prisma.PollGetPayload<{
  include: typeof pollInclude;
}>;

function toPoll(record: PollRecord): Poll {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    timezone: record.timezone,
    createdAt: record.createdAt.toISOString(),
    timeslots: record.timeslots.map((timeslot) => ({
      id: timeslot.id,
      date: timeslot.date,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      label: formatTimeslotLabel(timeslot.date, timeslot.startTime, timeslot.endTime, record.timezone, record.timezone),
    })),
    invitees: record.invitees.map((invitee) => ({
      id: invitee.id,
      name: invitee.name,
      timeZone: invitee.timeZone,
      timeZoneLabel: invitee.timeZoneLabel || getTimeZoneDisplayLabel(invitee.timeZone, record.timeslots[0]?.date, record.timeslots[0]?.startTime),
      email: invitee.email,
      note: invitee.note,
    })),
    participants: record.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      submittedAt: participant.submittedAt.toISOString(),
      votes: participant.votes.map((vote) => ({
        timeslotId: vote.timeslotId,
        value: vote.value as Vote["value"],
      })),
    })),
  };
}

async function getPollRecordOrThrow(slug: string): Promise<PollRecord> {
  const poll = await prisma.poll.findUnique({
    where: { slug },
    include: pollInclude,
  });

  if (!poll) {
    throw new Error("Poll not found");
  }

  return poll;
}

export async function listPolls(): Promise<Poll[]> {
  const polls = await prisma.poll.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: pollInclude,
  });

  return polls.map(toPoll);
}

export async function getDefaultPollSlug(): Promise<string | null> {
  const poll = await prisma.poll.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      slug: true,
    },
  });

  return poll?.slug ?? null;
}

export async function getPollBySlug(slug: string): Promise<Poll | null> {
  const poll = await prisma.poll.findUnique({
    where: { slug },
    include: pollInclude,
  });

  return poll ? toPoll(poll) : null;
}

export async function getParticipantByName(slug: string, rawName: string) {
  const name = rawName.trim();
  const poll = await prisma.poll.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!poll) {
    return null;
  }

  const participant = await prisma.participant.findUnique({
    where: {
      pollId_name: {
        pollId: poll.id,
        name,
      },
    },
    include: {
      votes: true,
    },
  });

  if (!participant) {
    return null;
  }

  return {
    id: participant.id,
    name: participant.name,
    submittedAt: participant.submittedAt.toISOString(),
    votes: participant.votes.map((vote) => ({
      timeslotId: vote.timeslotId,
      value: vote.value as Vote["value"],
    })),
  };
}

export async function saveParticipantVotes(slug: string, input: unknown) {
  const payload = participantPayloadSchema.parse(input);
  const poll = await prisma.poll.findUnique({
    where: { slug },
    include: {
      timeslots: {
        orderBy: {
          order: "asc",
        },
      },
      invitees: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!poll) {
    throw new Error("Poll not found");
  }

  const expectedTimeslotIds = poll.timeslots.map((timeslot) => timeslot.id);
  const submittedTimeslotIds = payload.votes.map((vote) => vote.timeslotId);
  const uniqueIds = new Set(submittedTimeslotIds);

  if (payload.votes.length !== uniqueIds.size) {
    throw new Error("Each timeslot may only be submitted once");
  }

  const invalidIds = submittedTimeslotIds.filter((timeslotId) => !expectedTimeslotIds.includes(timeslotId));
  if (invalidIds.length > 0) {
    throw new Error("One or more submitted votes are invalid");
  }

  const inviteeNames = poll.invitees.map((invitee) => invitee.name);

  if (!inviteeNames.includes(payload.name)) {
    throw new Error("Selected participant is not part of this poll");
  }

  if (payload.inviteToken) {
    const inviteeNameFromToken = resolveInviteeNameFromToken(slug, payload.inviteToken, inviteeNames);

    if (!inviteeNameFromToken) {
      throw new Error("Invalid invite token");
    }

    if (!isAdminInviteeName(inviteeNameFromToken) && inviteeNameFromToken !== payload.name) {
      throw new Error("This invite link cannot update another participant");
    }
  }

  const normalizedVotes = expectedTimeslotIds.map((timeslotId) => ({
    timeslotId,
    value: payload.votes.find((vote) => vote.timeslotId === timeslotId)?.value ?? "NO",
  }));

  const existingParticipant = await prisma.participant.findUnique({
    where: {
      pollId_name: {
        pollId: poll.id,
        name: payload.name,
      },
    },
    select: {
      id: true,
    },
  });

  const participant = await prisma.$transaction(async (tx) => {
    const savedParticipant = existingParticipant
      ? await tx.participant.update({
          where: { id: existingParticipant.id },
          data: {
            submittedAt: new Date(),
          },
        })
      : await tx.participant.create({
          data: {
            pollId: poll.id,
            name: payload.name,
            submittedAt: new Date(),
          },
        });

    await tx.vote.deleteMany({
      where: {
        participantId: savedParticipant.id,
      },
    });

    await tx.vote.createMany({
      data: normalizedVotes.map((vote) => ({
        participantId: savedParticipant.id,
        timeslotId: vote.timeslotId,
        value: vote.value,
      })),
    });

    return tx.participant.findUniqueOrThrow({
      where: { id: savedParticipant.id },
      include: {
        votes: true,
      },
    });
  });

  const refreshedPoll = await getPollRecordOrThrow(slug);

  return {
    mode: existingParticipant ? "updated" : "created",
    participant: {
      id: participant.id,
      name: participant.name,
      submittedAt: participant.submittedAt.toISOString(),
      votes: participant.votes.map((vote) => ({
        timeslotId: vote.timeslotId,
        value: vote.value as Vote["value"],
      })),
    },
    poll: toPoll(refreshedPoll),
  };
}
