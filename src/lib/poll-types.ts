export const voteValues = ["YES", "MAYBE", "NO"] as const;

export type VoteValue = (typeof voteValues)[number];

export interface Timeslot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface Vote {
  timeslotId: string;
  value: VoteValue;
}

export interface Participant {
  id: string;
  name: string;
  votes: Vote[];
  submittedAt: string;
}

export interface Invitee {
  id: string;
  name: string;
  isAdmin: boolean;
  timeZone: string;
  timeZoneLabel: string;
}

export interface Poll {
  id: string;
  slug: string;
  title: string;
  description: string;
  timezone: string;
  accessMode: "INVITE" | "SHARED";
  timeslots: Timeslot[];
  participants: Participant[];
  invitees: Invitee[];
  createdAt: string;
}

export interface TimeslotTally {
  timeslot: Timeslot;
  yesCount: number;
  maybeCount: number;
  noCount: number;
  score: number;
}
