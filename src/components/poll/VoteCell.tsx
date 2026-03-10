import { VoteValue } from "@/types/poll";
import { Check, HelpCircle, X } from "lucide-react";

interface VoteCellProps {
  value: VoteValue | undefined;
  onChange: (value: VoteValue) => void;
}

const cycleOrder: VoteValue[] = ["yes", "maybe", "no"];

export function VoteCell({ value, onChange }: VoteCellProps) {
  const currentIndex = value ? cycleOrder.indexOf(value) : -1;

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % cycleOrder.length;
    onChange(cycleOrder[nextIndex]);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-full h-9 rounded-lg flex items-center justify-center
        transition-all duration-150 ease-out
        font-medium text-sm select-none cursor-pointer
        border
        ${
          value === "yes"
            ? "bg-vote-yes text-white border-vote-yes shadow-sm"
            : value === "maybe"
            ? "bg-vote-maybe text-white border-vote-maybe shadow-sm"
            : value === "no"
            ? "bg-vote-no text-muted-foreground border-vote-no"
            : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50"
        }
      `}
      aria-label={value ?? "not voted"}
    >
      {value === "yes" && <Check className="w-4 h-4" strokeWidth={2.5} />}
      {value === "maybe" && <HelpCircle className="w-4 h-4" strokeWidth={2} />}
      {value === "no" && <X className="w-3.5 h-3.5" strokeWidth={2} />}
      {!value && <span className="text-xs font-semibold tracking-wide">Vote</span>}
    </button>
  );
}
