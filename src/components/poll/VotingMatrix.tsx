import { Timeslot, Vote, VoteValue } from "@/types/poll";
import { VoteCell } from "./VoteCell";
import { getVoteForSlot } from "@/lib/pollUtils";

interface VotingMatrixProps {
  timeslots: Timeslot[];
  votes: Vote[];
  onVoteChange: (timeslotId: string, value: VoteValue) => void;
  disabled?: boolean;
}

export function VotingMatrix({ timeslots, votes, onVoteChange, disabled }: VotingMatrixProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {timeslots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground">{slot.label}</span>
          </div>
          <div className="w-20 flex-shrink-0">
            {disabled ? (
              <div className="h-9 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">—</span>
              </div>
            ) : (
              <VoteCell
                value={getVoteForSlot(votes, slot.id)}
                onChange={(value) => onVoteChange(slot.id, value)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
