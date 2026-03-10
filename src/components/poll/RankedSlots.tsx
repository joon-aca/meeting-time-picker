"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, HelpCircle, Sparkles } from "lucide-react";
import { Poll } from "@/lib/poll-types";
import { rankSlots, tallyVotes } from "@/lib/poll-utils";
import { cn } from "@/lib/utils";

interface RankedSlotsProps {
  poll: Poll;
}

const DEFAULT_VISIBLE_SLOTS = 5;

type RankedSlotTone = {
  card: string;
  rank: string;
  percent: string;
  accent: string;
  label: string;
  labelClassName: string;
  celebratory?: boolean;
};

function getAvailabilityPercentage(yesCount: number, maybeCount: number, totalInvitees: number) {
  if (totalInvitees === 0) {
    return 0;
  }

  return Math.round(((yesCount + maybeCount) / totalInvitees) * 100);
}

function getRankedSlotTone(yesCount: number, maybeCount: number, totalInvitees: number): RankedSlotTone {
  const yesRate = totalInvitees === 0 ? 0 : yesCount / totalInvitees;
  const coverageRate = totalInvitees === 0 ? 0 : (yesCount + maybeCount) / totalInvitees;
  const fullCoverage = yesCount + maybeCount === totalInvitees;

  if (yesCount === totalInvitees && totalInvitees > 0) {
    return {
      card:
        "ranking-card-confetti border-fuchsia-300/80 bg-[linear-gradient(135deg,rgba(253,242,248,0.98),rgba(245,208,254,0.86),rgba(196,181,253,0.9))] shadow-[0_14px_40px_rgba(192,38,211,0.18)]",
      rank: "bg-fuchsia-600 text-white shadow-sm",
      percent: "bg-white/80 text-fuchsia-800",
      accent: "text-fuchsia-800",
      label: "Let's GOOO!",
      labelClassName: "bg-fuchsia-600 text-white",
      celebratory: true,
    };
  }

  if (fullCoverage) {
    if (yesRate >= 0.75) {
      return {
        card:
          "border-emerald-300/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(209,250,229,0.94),rgba(167,243,208,0.9))] shadow-[0_10px_28px_rgba(16,185,129,0.12)]",
        rank: "bg-emerald-600 text-white",
        percent: "bg-white/75 text-emerald-800",
        accent: "text-emerald-800",
        label: "Everyone's in",
        labelClassName: "bg-emerald-600 text-white",
      };
    }

    return {
      card:
        "border-sky-300/80 bg-[linear-gradient(135deg,rgba(239,246,255,0.98),rgba(224,242,254,0.94),rgba(254,243,199,0.88))] shadow-[0_10px_28px_rgba(14,165,233,0.12)]",
      rank: "bg-sky-600 text-white",
      percent: "bg-white/75 text-sky-800",
      accent: "text-sky-800",
      label: "Everyone can make it",
      labelClassName: "bg-sky-600 text-white",
    };
  }

  if (coverageRate >= 0.85 && yesRate >= 0.55) {
    return {
      card:
        "border-lime-300/80 bg-[linear-gradient(135deg,rgba(247,254,231,0.98),rgba(236,252,203,0.94),rgba(220,252,231,0.88))] shadow-[0_10px_24px_rgba(132,204,22,0.1)]",
      rank: "bg-lime-600 text-white",
      percent: "bg-white/75 text-lime-800",
      accent: "text-lime-800",
      label: "Very strong",
      labelClassName: "bg-lime-600 text-white",
    };
  }

  if (coverageRate >= 0.7) {
    return {
      card:
        "border-amber-300/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(254,243,199,0.94),rgba(254,249,195,0.88))] shadow-[0_10px_24px_rgba(245,158,11,0.1)]",
      rank: "bg-amber-500 text-white",
      percent: "bg-white/75 text-amber-800",
      accent: "text-amber-800",
      label: "Workable",
      labelClassName: "bg-amber-500 text-white",
    };
  }

  if (coverageRate >= 0.6) {
    return {
      card:
        "border-slate-300/80 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.94),rgba(226,232,240,0.9))] shadow-[0_10px_20px_rgba(100,116,139,0.08)]",
      rank: "bg-slate-500 text-white",
      percent: "bg-white/75 text-slate-700",
      accent: "text-slate-700",
      label: "Acceptable",
      labelClassName: "bg-slate-500 text-white",
    };
  }

  return {
    card: "border-border bg-secondary",
    rank: "bg-border text-muted-foreground",
    percent: "bg-muted text-muted-foreground",
    accent: "text-slate-600",
    label: "Long shot",
    labelClassName: "bg-slate-300 text-slate-700",
  };
}

export function RankedSlots({ poll }: RankedSlotsProps) {
  const [showAll, setShowAll] = useState(false);
  const ranked = rankSlots(tallyVotes(poll));
  const totalInvitees = poll.invitees.length;
  const visibleRanked = showAll ? ranked : ranked.slice(0, DEFAULT_VISIBLE_SLOTS);
  const hiddenCount = Math.max(0, ranked.length - DEFAULT_VISIBLE_SLOTS);

  return (
    <div className="space-y-3">
      {visibleRanked.map((tally, index) => {
        const percentage = getAvailabilityPercentage(tally.yesCount, tally.maybeCount, totalInvitees);
        const tone = getRankedSlotTone(tally.yesCount, tally.maybeCount, totalInvitees);

        return (
          <div
            key={tally.timeslot.id}
            className={cn(
              "animate-fade-in relative overflow-hidden rounded-xl border px-4 py-3 transition-transform duration-200 hover:-translate-y-0.5 sm:px-5",
              tone.card,
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {tone.celebratory ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <span className="ranking-confetti-piece left-[8%] top-[18%] bg-fuchsia-400" />
                <span className="ranking-confetti-piece left-[18%] top-[8%] bg-amber-300 [animation-delay:140ms]" />
                <span className="ranking-confetti-piece left-[72%] top-[12%] bg-sky-300 [animation-delay:260ms]" />
                <span className="ranking-confetti-piece left-[88%] top-[20%] bg-emerald-300 [animation-delay:90ms]" />
                <span className="ranking-confetti-piece left-[14%] top-[72%] bg-violet-300 [animation-delay:200ms]" />
                <span className="ranking-confetti-piece left-[82%] top-[74%] bg-rose-300 [animation-delay:320ms]" />
              </div>
            ) : null}

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-start gap-4 sm:flex-1 sm:items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    tone.rank,
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{tally.timeslot.label}</p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
                        tone.labelClassName,
                      )}
                    >
                      {tone.celebratory ? <Sparkles className="mr-1 h-3.5 w-3.5" /> : null}
                      {tone.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span
                  className={cn(
                    "inline-flex min-w-[5.25rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold",
                    tone.percent,
                  )}
                >
                  {percentage}% coverage
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-xs font-medium text-primary">
                  <Check className="h-3.5 w-3.5" /> {tally.yesCount} yes
                </span>
                <span className={cn("inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-xs font-medium", tone.accent)}>
                  <HelpCircle className="h-3.5 w-3.5" /> {tally.maybeCount} maybe
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showAll ? "Show Top 5" : `Show ${hiddenCount} More`}
        </button>
      ) : null}
    </div>
  );
}
