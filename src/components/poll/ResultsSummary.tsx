import { Poll } from "@/types/poll";
import { tallyVotes } from "@/lib/pollUtils";

interface ResultsSummaryProps {
  poll: Poll;
}

export function ResultsSummary({ poll }: ResultsSummaryProps) {
  const tallies = tallyVotes(poll);
  const totalParticipants = poll.participants.length;
  const totalYes = tallies.reduce((sum, t) => sum + t.yesCount, 0);
  const totalMaybe = tallies.reduce((sum, t) => sum + t.maybeCount, 0);

  const cards = [
    { label: "Participants", value: totalParticipants },
    { label: "Timeslots", value: poll.timeslots.length },
    { label: "Yes Votes", value: totalYes },
    { label: "Maybe Votes", value: totalMaybe },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-secondary rounded-lg px-4 py-3 border border-border"
        >
          <p className="text-2xl font-semibold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
