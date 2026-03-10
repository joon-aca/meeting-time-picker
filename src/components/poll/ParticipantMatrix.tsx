import { Poll, VoteValue } from "@/types/poll";
import { getVoteForSlot } from "@/lib/pollUtils";
import { Check, HelpCircle, Minus } from "lucide-react";

interface ParticipantMatrixProps {
  poll: Poll;
}

function VoteIcon({ value }: { value: VoteValue | undefined }) {
  if (value === "yes") return <Check className="w-4 h-4 text-primary" />;
  if (value === "maybe") return <HelpCircle className="w-4 h-4 text-accent-foreground" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

export function ParticipantMatrix({ poll }: ParticipantMatrixProps) {
  if (poll.participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No responses yet. Be the first to vote!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground sticky left-0 bg-background">
              Timeslot
            </th>
            {poll.participants.map((p) => (
              <th
                key={p.id}
                className="py-2 px-2 text-xs font-medium text-muted-foreground text-center whitespace-nowrap"
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {poll.timeslots.map((slot) => (
            <tr key={slot.id} className="hover:bg-surface-hover transition-colors">
              <td className="py-2 px-2 text-xs font-medium text-foreground sticky left-0 bg-background whitespace-nowrap">
                {slot.label}
              </td>
              {poll.participants.map((p) => (
                <td key={p.id} className="py-2 px-2 text-center">
                  <div className="flex justify-center">
                    <VoteIcon value={getVoteForSlot(p.votes, slot.id)} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
