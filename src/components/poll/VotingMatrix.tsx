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
    <div className="space-y-1">
      {timeslots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-hover transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground">{slot.label}</span>
          </div>
          <div className="w-24 flex-shrink-0">
            {disabled ? (
              <div className="h-11 flex items-center justify-center">
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
