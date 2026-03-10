export type VoteValue = "yes" | "maybe" | "no";

export interface Timeslot {
  id: string;
  date: string;       // ISO date string e.g. "2026-03-15"
  startTime: string;  // e.g. "09:00"
  endTime: string;    // e.g. "10:00"
  label: string;      // formatted display label
}

export interface Vote {
  timeslotId: string;
  value: VoteValue;
}

export interface Participant {
  id: string;
  name: string;
  votes: Vote[];
  submittedAt: string; // ISO timestamp
}

export interface Poll {
  id: string;
  slug: string;
  title: string;
  description: string;
  timezone: string;
  timeslots: Timeslot[];
  participants: Participant[];
  createdAt: string;
}

export interface TimeslotTally {
  timeslot: Timeslot;
  yesCount: number;
  maybeCount: number;
  noCount: number;
  score: number; // yes=2, maybe=1, no=0
}
