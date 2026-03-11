import { useEffect, useState } from "react";
import { Check, HelpCircle, Minus } from "lucide-react";
import { Poll, VoteValue } from "@/lib/poll-types";
import { getTimeslotDisplayMeta, getVoteForSlot } from "@/lib/poll-utils";
import { cn } from "@/lib/utils";

interface ParticipantMatrixProps {
  poll: Poll;
  sourceTimeZone: string;
  targetTimeZone: string;
  forceShowAllWeeks?: boolean;
}

function VoteIcon({ value }: { value: VoteValue | undefined }) {
  const resolvedValue = value ?? "NO";

  const styles =
    resolvedValue === "YES"
      ? {
          label: "Yes",
          icon: <Check className="h-3.5 w-3.5" />,
          className: "bg-emerald-100 text-emerald-700",
        }
      : resolvedValue === "MAYBE"
        ? {
            label: "Maybe",
            icon: <HelpCircle className="h-3.5 w-3.5" />,
            className: "bg-amber-100 text-amber-700",
          }
        : {
            label: "No",
            icon: <Minus className="h-3.5 w-3.5" />,
            className: "bg-slate-200 text-slate-600",
          };

  return (
    <span
      className={cn(
        "inline-flex min-w-[4.75rem] items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
        styles.className,
      )}
      aria-label={styles.label}
    >
      {styles.icon}
      <span>{styles.label}</span>
    </span>
  );
}

type DisplaySlot = {
  id: string;
  meta: ReturnType<typeof getTimeslotDisplayMeta>;
};

export function ParticipantMatrix({
  poll,
  sourceTimeZone,
  targetTimeZone,
  forceShowAllWeeks = false,
}: ParticipantMatrixProps) {
  const [showAllWeeks, setShowAllWeeks] = useState(forceShowAllWeeks);

  const displaySlots: DisplaySlot[] = poll.timeslots.map((timeslot) => ({
    id: timeslot.id,
    meta: getTimeslotDisplayMeta(timeslot, sourceTimeZone, targetTimeZone),
  }));

  const weeks = Array.from(
    displaySlots.reduce<Map<string, { weekLabel: string; slots: DisplaySlot[] }>>((map, slot) => {
      const existing = map.get(slot.meta.weekKey);
      if (existing) {
        existing.slots.push(slot);
        return map;
      }

      map.set(slot.meta.weekKey, { weekLabel: slot.meta.weekLabel, slots: [slot] });
      return map;
    }, new Map()),
  );
  const visibleWeeks = forceShowAllWeeks || showAllWeeks ? weeks : weeks.slice(0, 1);
  const hiddenWeek = weeks[1];

  useEffect(() => {
    if (forceShowAllWeeks) {
      setShowAllWeeks(true);
    }
  }, [forceShowAllWeeks]);

  if (poll.participants.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No responses yet. Be the first to vote!</div>;
  }

  return (
    <div className="space-y-6">
      {visibleWeeks.map(([weekKey, week]) => {
        const dayEntries = Array.from(
          week.slots.reduce<Map<string, { dayLabel: string; slots: DisplaySlot[] }>>((map, slot) => {
            const existing = map.get(slot.meta.dayKey);
            if (existing) {
              existing.slots.push(slot);
              return map;
            }

            map.set(slot.meta.dayKey, { dayLabel: slot.meta.dayLabel, slots: [slot] });
            return map;
          }, new Map()),
        );

        const rowKeys = Array.from(new Set(week.slots.map((slot) => slot.meta.timeKey))).sort();
        const rowLabels = new Map(week.slots.map((slot) => [slot.meta.timeKey, slot.meta.timeRangeLabel]));

        return (
          <section key={weekKey} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full table-fixed">
                <thead className="bg-gradient-to-l from-primary/[0.08] to-primary/[0.04]">
                  <tr>
                    <th colSpan={dayEntries.length + 1} className="px-4 pt-4 pb-2 text-left">
                      <h3 className="font-display text-base font-bold tracking-tight text-foreground">{week.weekLabel}</h3>
                    </th>
                  </tr>
                  <tr className="border-b border-border">
                    <th className="w-40 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Time
                    </th>
                    {dayEntries.map(([dayKey, day]) => (
                      <th key={dayKey} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {day.dayLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowKeys.map((rowKey) => (
                    <tr key={rowKey} className="align-top border-b border-border last:border-b-0">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{rowLabels.get(rowKey)}</td>
                      {dayEntries.map(([dayKey, day]) => {
                        const slot = day.slots.find((entry) => entry.meta.timeKey === rowKey);

                        return (
                          <td key={dayKey} className="px-4 py-3">
                            {slot ? (
                              <div className="space-y-2">
                                {poll.participants.map((participant) => (
                                  <div key={participant.id} className="flex items-center justify-between gap-3 rounded-md bg-background/70 px-3 py-2">
                                    <span className="truncate text-xs font-medium text-foreground">{participant.name}</span>
                                    <VoteIcon value={getVoteForSlot(participant.votes, slot.id)} />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-9" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 md:hidden">
              {dayEntries.map(([dayKey, day], dayIndex) => (
                <div key={dayKey} className="rounded-lg border border-border bg-background/70">
                  <div className="border-b border-border bg-gradient-to-l from-primary/[0.08] to-primary/[0.04] px-4 pb-2.5 pt-3">
                    {dayIndex === 0 ? (
                      <p className="mb-0.5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-primary/60">{week.weekLabel}</p>
                    ) : null}
                    <p className="font-display text-sm font-bold tracking-tight text-foreground">{day.dayLabel}</p>
                  </div>
                  <div className="space-y-4 p-4">
                    {day.slots
                      .sort((left, right) => left.meta.timeKey.localeCompare(right.meta.timeKey))
                      .map((slot) => (
                        <div key={slot.id} className="space-y-2">
                          <div className="text-sm font-medium text-foreground">{slot.meta.timeRangeLabel}</div>
                          <div className="space-y-2">
                            {poll.participants.map((participant) => (
                              <div key={participant.id} className="flex items-center justify-between gap-3 rounded-md bg-card px-3 py-2">
                                <span className="truncate text-xs font-medium text-foreground">{participant.name}</span>
                                <VoteIcon value={getVoteForSlot(participant.votes, slot.id)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {!forceShowAllWeeks && !showAllWeeks && hiddenWeek ? (
        <div className="rounded-xl border border-dashed border-border bg-secondary/50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Need to compare week two?</p>
              <p className="text-xs text-muted-foreground">
                Show {hiddenWeek[1].weekLabel} in the response grid if the first week is not enough.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllWeeks(true)}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Show {hiddenWeek[1].weekLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
