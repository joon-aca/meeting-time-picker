import { expect, it } from "vitest";
import { formatTimeslotLabel, getTimeZoneAbbreviationsForSlots } from "@/lib/poll-utils";

const slots = [
  { date: "2026-10-20", startTime: "08:00" },
  { date: "2026-10-27", startTime: "08:00" },
];

it("labels the European clock change across the October poll", () => {
  expect(getTimeZoneAbbreviationsForSlots("Europe/Berlin", slots)).toEqual(["CEST", "CET"]);
  expect(formatTimeslotLabel("2026-10-20", "08:00", "09:30", "America/Los_Angeles", "Europe/Berlin"))
    .toContain("5:00 PM–6:30 PM");
  expect(formatTimeslotLabel("2026-10-27", "08:00", "09:30", "America/Los_Angeles", "Europe/Berlin"))
    .toContain("4:00 PM–5:30 PM");
});
