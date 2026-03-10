import { Check, HelpCircle, X } from "lucide-react";
import { VoteValue } from "@/lib/poll-types";

interface VoteCellProps {
  value: VoteValue | undefined;
  onChange: (value: VoteValue) => void;
}

export function VoteCell({ value, onChange }: VoteCellProps) {
  const displayValue = value === "NO" ? undefined : value;

  const handleClick = () => {
    if (!displayValue) {
      onChange("MAYBE");
      return;
    }

    if (displayValue === "MAYBE") {
      onChange("YES");
      return;
    }

    onChange("NO");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        h-9 w-full cursor-pointer select-none rounded-lg border text-sm font-medium transition-all duration-150 ease-out
        ${
          displayValue === "YES"
            ? "border-vote-yes bg-vote-yes text-white shadow-sm"
            : displayValue === "MAYBE"
              ? "border-vote-maybe bg-vote-maybe text-white shadow-sm"
              : "border-vote-no bg-vote-no text-muted-foreground hover:border-muted-foreground/40"
        }
      `}
      aria-label={displayValue ?? "no"}
    >
      {displayValue === "YES" ? <Check className="mx-auto h-4 w-4" strokeWidth={2.5} /> : null}
      {displayValue === "MAYBE" ? <HelpCircle className="mx-auto h-4 w-4" strokeWidth={2} /> : null}
      {!displayValue ? <X className="mx-auto h-3.5 w-3.5" strokeWidth={2} /> : null}
    </button>
  );
}
