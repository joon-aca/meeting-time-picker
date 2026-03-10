import { Poll } from "@/types/poll";
import { tallyVotes, rankSlots } from "@/lib/pollUtils";
import { Check, HelpCircle } from "lucide-react";

interface RankedSlotsProps {
  poll: Poll;
}

export function RankedSlots({ poll }: RankedSlotsProps) {
  const ranked = rankSlots(tallyVotes(poll));

  return (
    <div className="space-y-2">
      {ranked.map((tally, index) => (
        <div
          key={tally.timeslot.id}
          className={`
            flex items-center gap-4 px-4 py-3 rounded-lg border
            ${index === 0 ? "border-primary bg-primary/5" : "border-border bg-secondary"}
            animate-fade-in
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span
            className={`
              text-sm font-semibold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
              ${index === 0 ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"}
            `}
          >
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {tally.timeslot.label}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs flex-shrink-0">
            <span className="flex items-center gap-1 text-primary font-medium">
              <Check className="w-3.5 h-3.5" /> {tally.yesCount}
            </span>
            <span className="flex items-center gap-1 text-accent-foreground font-medium">
              <HelpCircle className="w-3.5 h-3.5" /> {tally.maybeCount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
