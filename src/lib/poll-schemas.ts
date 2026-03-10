import { z } from "zod";
import { voteValues } from "@/lib/poll-types";

export const voteValueSchema = z.enum(voteValues);

export const participantNameSchema = z
  .string()
  .trim()
  .min(1, "Please enter your name")
  .max(120, "Name is too long");

export const participantVoteSchema = z.object({
  timeslotId: z.string().min(1),
  value: voteValueSchema,
});

export const participantPayloadSchema = z.object({
  name: participantNameSchema,
  votes: z.array(participantVoteSchema),
});

const seedVoteSchema = z.object({
  slotOrder: z.number().int().min(0),
  value: voteValueSchema,
});

const seedParticipantSchema = z.object({
  name: participantNameSchema,
  submittedAt: z.string().datetime(),
  votes: z.array(seedVoteSchema),
});

const seedInviteeSchema = z.object({
  name: z.string().trim().min(1),
  timeZone: z.string().trim().min(1),
  timeZoneLabel: z.string().trim().min(1),
  email: z.string().email().nullable().optional(),
  note: z.string().trim().min(1).nullable().optional(),
});

const seedTimeslotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const seedPollSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  createdAt: z.string().datetime(),
  timeslots: z.array(seedTimeslotSchema).min(1),
  invitees: z.array(seedInviteeSchema).default([]),
  participants: z.array(seedParticipantSchema).default([]),
});

export const seedFileSchema = z.array(seedPollSchema).length(1);
