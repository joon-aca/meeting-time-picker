import { Poll } from "@/lib/poll-types";
import { tallyVotes } from "@/lib/poll-utils";

interface ResultsSummaryProps {
  poll: Poll;
}

export function ResultsSummary({ poll }: ResultsSummaryProps) {
  const tallies = tallyVotes(poll);
  const totalParticipants = poll.participants.length;
  const totalYes = tallies.reduce((sum, tally) => sum + tally.yesCount, 0);
  const totalMaybe = tallies.reduce((sum, tally) => sum + tally.maybeCount, 0);

  const cards = [
    { label: "Responded", value: totalParticipants, sub: `of ${poll.invitees.length}` },
    { label: "Timeslots", value: poll.timeslots.length, sub: "offered" },
    { label: "Yes Votes", value: totalYes, sub: "across all slots" },
    { label: "Maybe Votes", value: totalMaybe, sub: "across all slots" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm"
        >
          <p className="text-3xl font-display font-bold tracking-tight text-foreground">{card.value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
