import { Poll } from "@/types/poll";

export const mockPoll: Poll = {
  id: "poll-001",
  slug: "team-offsite-planning",
  title: "Team Offsite Planning",
  description:
    "Let's find the best time for our spring offsite. We're looking at a few options across the last two weeks of March. Please mark your availability so we can finalize the date.",
  timezone: "America/New_York (EST)",
  createdAt: "2026-03-01T10:00:00Z",
  timeslots: [
    {
      id: "ts-1",
      date: "2026-03-16",
      startTime: "09:00",
      endTime: "12:00",
      label: "Mon, Mar 16 · 9:00–12:00 AM",
    },
    {
      id: "ts-2",
      date: "2026-03-16",
      startTime: "14:00",
      endTime: "17:00",
      label: "Mon, Mar 16 · 2:00–5:00 PM",
    },
    {
      id: "ts-3",
      date: "2026-03-18",
      startTime: "10:00",
      endTime: "13:00",
      label: "Wed, Mar 18 · 10:00 AM–1:00 PM",
    },
    {
      id: "ts-4",
      date: "2026-03-20",
      startTime: "09:00",
      endTime: "12:00",
      label: "Fri, Mar 20 · 9:00–12:00 AM",
    },
    {
      id: "ts-5",
      date: "2026-03-23",
      startTime: "13:00",
      endTime: "16:00",
      label: "Mon, Mar 23 · 1:00–4:00 PM",
    },
    {
      id: "ts-6",
      date: "2026-03-25",
      startTime: "09:00",
      endTime: "11:00",
      label: "Wed, Mar 25 · 9:00–11:00 AM",
    },
  ],
  participants: [
    {
      id: "p-1",
      name: "Alice Chen",
      submittedAt: "2026-03-05T14:30:00Z",
      votes: [
        { timeslotId: "ts-1", value: "yes" },
        { timeslotId: "ts-2", value: "maybe" },
        { timeslotId: "ts-3", value: "yes" },
        { timeslotId: "ts-4", value: "no" },
        { timeslotId: "ts-5", value: "yes" },
        { timeslotId: "ts-6", value: "maybe" },
      ],
    },
    {
      id: "p-2",
      name: "Ben Rivera",
      submittedAt: "2026-03-06T09:15:00Z",
      votes: [
        { timeslotId: "ts-1", value: "yes" },
        { timeslotId: "ts-2", value: "yes" },
        { timeslotId: "ts-3", value: "no" },
        { timeslotId: "ts-4", value: "yes" },
        { timeslotId: "ts-5", value: "maybe" },
        { timeslotId: "ts-6", value: "yes" },
      ],
    },
    {
      id: "p-3",
      name: "Clara Johansson",
      submittedAt: "2026-03-07T16:45:00Z",
      votes: [
        { timeslotId: "ts-1", value: "maybe" },
        { timeslotId: "ts-2", value: "no" },
        { timeslotId: "ts-3", value: "yes" },
        { timeslotId: "ts-4", value: "yes" },
        { timeslotId: "ts-5", value: "yes" },
        { timeslotId: "ts-6", value: "no" },
      ],
    },
  ],
};
