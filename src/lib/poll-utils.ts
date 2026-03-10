import { format, parseISO, startOfWeek } from "date-fns";
import { Poll, Timeslot, TimeslotTally, VoteValue } from "@/lib/poll-types";

function getFormatter(
  locale: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { timeZone, ...options });
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = getFormatter("en-US", timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  return formatter.formatToParts(date).reduce<Record<string, string>>((parts, part) => {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }

    return parts;
  }, {});
}

function getTimeZoneOffsetMilliseconds(date: Date, timeZone: string): number {
  const parts = getTimeZoneParts(date, timeZone);

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - date.getTime();
}

export function zonedDateTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getTimeZoneOffsetMilliseconds(new Date(utcGuess), timeZone);
  let correctedUtc = utcGuess - initialOffset;
  const correctedOffset = getTimeZoneOffsetMilliseconds(new Date(correctedUtc), timeZone);

  if (correctedOffset !== initialOffset) {
    correctedUtc = utcGuess - correctedOffset;
  }

  return new Date(correctedUtc);
}

export function getVoteScore(value: VoteValue): number {
  if (value === "YES") return 2;
  if (value === "MAYBE") return 1;
  return 0;
}

export function getTimeslotDateTime(timeslot: Timeslot): Date {
  return parseISO(`${timeslot.date}T${timeslot.startTime}:00`);
}

export function getTimeZoneAbbreviation(timeZone: string, date: string, time = "12:00"): string {
  const instant = zonedDateTimeToUtc(date, time, timeZone);
  const parts = getFormatter("en-US", timeZone, {
    timeZoneName: "short",
    hour: "numeric",
  }).formatToParts(instant);

  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function getTimeZoneDisplayLabel(timeZone: string, date?: string, time = "12:00"): string {
  if (!date) {
    return timeZone;
  }

  return `${timeZone} (${getTimeZoneAbbreviation(timeZone, date, time)})`;
}

export function formatTimeslotLabel(
  date: string,
  startTime: string,
  endTime: string,
  sourceTimeZone: string,
  targetTimeZone: string,
): string {
  const start = zonedDateTimeToUtc(date, startTime, sourceTimeZone);
  const end = zonedDateTimeToUtc(date, endTime, sourceTimeZone);

  const dateFormatter = getFormatter("en-US", targetTimeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = getFormatter("en-US", targetTimeZone, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`;
}

export interface TimeslotDisplayMeta {
  dayKey: string;
  dayLabel: string;
  timeKey: string;
  timeRangeLabel: string;
  weekKey: string;
  weekLabel: string;
}

export function getTimeslotDisplayMeta(
  timeslot: Pick<Timeslot, "date" | "startTime" | "endTime">,
  sourceTimeZone: string,
  targetTimeZone: string,
): TimeslotDisplayMeta {
  const start = zonedDateTimeToUtc(timeslot.date, timeslot.startTime, sourceTimeZone);
  const end = zonedDateTimeToUtc(timeslot.date, timeslot.endTime, sourceTimeZone);
  const parts = getTimeZoneParts(start, targetTimeZone);
  const dayKey = `${parts.year}-${parts.month}-${parts.day}`;
  const weekStart = startOfWeek(parseISO(`${dayKey}T00:00:00`), { weekStartsOn: 1 });
  const weekKey = format(weekStart, "yyyy-MM-dd");
  const dayFormatter = getFormatter("en-US", targetTimeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = getFormatter("en-US", targetTimeZone, {
    hour: "numeric",
    minute: "2-digit",
  });
  const startTimeParts = getTimeZoneParts(start, targetTimeZone);

  return {
    dayKey,
    dayLabel: dayFormatter.format(start),
    timeKey: `${startTimeParts.hour}:${startTimeParts.minute}`,
    timeRangeLabel: `${timeFormatter.format(start)}-${timeFormatter.format(end)}`,
    weekKey,
    weekLabel: `Week of ${format(weekStart, "MMM d")}`,
  };
}

export function tallyVotes(poll: Poll): TimeslotTally[] {
  return poll.timeslots.map((timeslot) => {
    let yesCount = 0;
    let maybeCount = 0;
    let noCount = 0;

    for (const participant of poll.participants) {
      const vote = participant.votes.find((entry) => entry.timeslotId === timeslot.id);
      if (vote?.value === "YES") yesCount += 1;
      if (vote?.value === "MAYBE") maybeCount += 1;
      if (vote?.value === "NO") noCount += 1;
    }

    return {
      timeslot,
      yesCount,
      maybeCount,
      noCount,
      score: yesCount * 2 + maybeCount,
    };
  });
}

export function rankSlots(tallies: TimeslotTally[]): TimeslotTally[] {
  return [...tallies].sort((left, right) => {
    const leftAvailableCount = left.yesCount + left.maybeCount;
    const rightAvailableCount = right.yesCount + right.maybeCount;

    // Prefer broader availability first, then stronger preference within that set.
    if (rightAvailableCount !== leftAvailableCount) return rightAvailableCount - leftAvailableCount;
    if (right.yesCount !== left.yesCount) return right.yesCount - left.yesCount;

    return getTimeslotDateTime(left.timeslot).getTime() - getTimeslotDateTime(right.timeslot).getTime();
  });
}

export function getVoteForSlot(votes: { timeslotId: string; value: VoteValue }[], timeslotId: string): VoteValue | undefined {
  return votes.find((vote) => vote.timeslotId === timeslotId)?.value;
}
