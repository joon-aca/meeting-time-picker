import { VoteValue } from "@/types/poll";
import { Check, HelpCircle, Minus } from "lucide-react";

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
        w-full h-11 rounded-md flex items-center justify-center
        transition-colors duration-150 ease-out
        font-medium text-sm select-none cursor-pointer
        border
        ${
          value === "yes"
            ? "bg-vote-yes text-primary-foreground border-vote-yes"
            : value === "maybe"
            ? "bg-vote-maybe text-accent-foreground border-vote-maybe"
            : value === "no"
            ? "bg-vote-no text-text-secondary border-vote-no"
            : "bg-secondary text-muted-foreground border-border hover:bg-surface-hover"
        }
      `}
      aria-label={value ?? "not voted"}
    >
      {value === "yes" && <Check className="w-5 h-5" strokeWidth={2.5} />}
      {value === "maybe" && <HelpCircle className="w-5 h-5" strokeWidth={2} />}
      {value === "no" && <Minus className="w-4 h-4" strokeWidth={2} />}
      {!value && <span className="text-xs tracking-wide">Vote</span>}
    </button>
  );
}
