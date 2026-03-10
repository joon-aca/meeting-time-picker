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
    { label: "Participants", value: totalParticipants },
    { label: "Timeslots", value: poll.timeslots.length },
    { label: "Yes Votes", value: totalYes },
    { label: "Maybe Votes", value: totalMaybe },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-secondary px-4 py-3">
          <p className="text-2xl font-semibold text-foreground">{card.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
