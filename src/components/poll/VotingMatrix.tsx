import { VoteCell } from "@/components/poll/VoteCell";
import { Timeslot, Vote, VoteValue } from "@/lib/poll-types";
import { getTimeslotDisplayMeta, getVoteForSlot } from "@/lib/poll-utils";

interface VotingMatrixProps {
  timeslots: Timeslot[];
  votes: Vote[];
  onVoteChange: (timeslotId: string, value: VoteValue) => void;
  disabled?: boolean;
  sourceTimeZone: string;
  targetTimeZone: string;
}

type DisplaySlot = {
  timeslot: Timeslot;
  meta: ReturnType<typeof getTimeslotDisplayMeta>;
};

export function VotingMatrix({
  timeslots,
  votes,
  onVoteChange,
  disabled,
  sourceTimeZone,
  targetTimeZone,
}: VotingMatrixProps) {
  const displaySlots: DisplaySlot[] = timeslots.map((timeslot) => ({
    timeslot,
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

  return (
    <div className="space-y-6">
      {weeks.map(([weekKey, week]) => {
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
            <div className="border-b border-border bg-secondary/70 px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">{week.weekLabel}</h3>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Time
                    </th>
                    {dayEntries.map(([dayKey, day]) => (
                      <th key={dayKey} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {day.dayLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowKeys.map((rowKey) => (
                    <tr key={rowKey} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{rowLabels.get(rowKey)}</td>
                      {dayEntries.map(([dayKey, day]) => {
                        const slot = day.slots.find((entry) => entry.meta.timeKey === rowKey);

                        return (
                          <td key={dayKey} className="px-4 py-3">
                            {slot ? (
                              disabled ? (
                                <div className="flex h-9 items-center justify-center">
                                  <span className="text-xs text-muted-foreground">-</span>
                                </div>
                              ) : (
                                <VoteCell
                                  value={getVoteForSlot(votes, slot.timeslot.id)}
                                  onChange={(value) => onVoteChange(slot.timeslot.id, value)}
                                />
                              )
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
              {dayEntries.map(([dayKey, day]) => (
                <div key={dayKey} className="rounded-lg border border-border bg-background/70">
                  <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
                    {day.dayLabel}
                  </div>
                  <div className="space-y-3 p-4">
                    {day.slots
                      .sort((left, right) => left.meta.timeKey.localeCompare(right.meta.timeKey))
                      .map((slot) => (
                        <div key={slot.timeslot.id} className="flex items-center gap-3">
                          <div className="min-w-0 flex-1 text-sm font-medium text-foreground">{slot.meta.timeRangeLabel}</div>
                          <div className="w-20 flex-shrink-0">
                            {disabled ? (
                              <div className="flex h-9 items-center justify-center">
                                <span className="text-xs text-muted-foreground">-</span>
                              </div>
                            ) : (
                              <VoteCell
                                value={getVoteForSlot(votes, slot.timeslot.id)}
                                onChange={(value) => onVoteChange(slot.timeslot.id, value)}
                              />
                            )}
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
    </div>
  );
}
