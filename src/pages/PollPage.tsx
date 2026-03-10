import { useState, useCallback } from "react";
import { Poll, Vote, VoteValue } from "@/types/poll";
import { mockPoll } from "@/data/mockPoll";
import { PollHeader } from "@/components/poll/PollHeader";
import { SectionLabel } from "@/components/poll/SectionLabel";
import { VotingMatrix } from "@/components/poll/VotingMatrix";
import { ResultsSummary } from "@/components/poll/ResultsSummary";
import { RankedSlots } from "@/components/poll/RankedSlots";
import { ParticipantMatrix } from "@/components/poll/ParticipantMatrix";

type PollPageState = "idle" | "loading" | "loaded" | "submitting" | "success" | "error";

export default function PollPage() {
  const [poll] = useState<Poll>(mockPoll);
  const [state, setState] = useState<PollPageState>("idle");
  const [participantName, setParticipantName] = useState("");
  const [votes, setVotes] = useState<Vote[]>([]);
  const [nameError, setNameError] = useState("");
  const [hasExisting, setHasExisting] = useState(false);

  const handleVoteChange = useCallback((timeslotId: string, value: VoteValue) => {
    setVotes((prev) => {
      const filtered = prev.filter((v) => v.timeslotId !== timeslotId);
      return [...filtered, { timeslotId, value }];
    });
  }, []);

  const handleLoadPrior = useCallback(() => {
    if (!participantName.trim()) {
      setNameError("Enter your name to load prior responses");
      return;
    }
    setNameError("");
    setState("loading");

    // Placeholder: simulate loading prior responses
    setTimeout(() => {
      const existing = poll.participants.find(
        (p) => p.name.toLowerCase() === participantName.trim().toLowerCase()
      );
      if (existing) {
        setVotes(existing.votes);
        setHasExisting(true);
      }
      setState("loaded");
    }, 600);
  }, [participantName, poll.participants]);

  const handleSubmit = useCallback(() => {
    if (!participantName.trim()) {
      setNameError("Please enter your name");
      return;
    }
    const allVoted = poll.timeslots.every((ts) =>
      votes.some((v) => v.timeslotId === ts.id)
    );
    if (!allVoted) {
      setNameError("Please vote on all timeslots");
      return;
    }
    setNameError("");
    setState("submitting");

    // Placeholder: simulate submit
    setTimeout(() => {
      setState("success");
    }, 800);
  }, [participantName, votes, poll.timeslots]);

  const unvotedCount = poll.timeslots.length - votes.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-poll px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Context Zone */}
        <PollHeader
          title={poll.title}
          description={poll.description}
          timezone={poll.timezone}
        />

        {/* Action Zone */}
        <div className="space-y-6">
          <SectionLabel>Your Availability</SectionLabel>

          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={participantName}
                onChange={(e) => {
                  setParticipantName(e.target.value);
                  if (nameError) setNameError("");
                }}
                className="w-full sm:w-72 px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                disabled={state === "submitting" || state === "success"}
              />
              {nameError && (
                <p className="text-xs text-destructive mt-1.5 animate-fade-in">{nameError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLoadPrior}
              disabled={state === "loading" || state === "submitting" || state === "success"}
              className="text-sm text-primary font-medium hover:underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state === "loading" ? "Loading…" : "Load prior responses"}
            </button>
          </div>

          {state === "success" ? (
            <div className="bg-primary/5 border border-primary rounded-lg px-5 py-4 animate-fade-in">
              <p className="text-sm font-medium text-primary">
                {hasExisting ? "Your availability has been updated." : "Your availability has been submitted."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Thank you, {participantName}!
              </p>
            </div>
          ) : (
            <>
              <VotingMatrix
                timeslots={poll.timeslots}
                votes={votes}
                onVoteChange={handleVoteChange}
                disabled={state === "submitting"}
              />

              {unvotedCount > 0 && votes.length > 0 && (
                <p className="text-xs text-muted-foreground animate-fade-in">
                  {unvotedCount} timeslot{unvotedCount > 1 ? "s" : ""} remaining
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={state === "submitting"}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {state === "submitting"
                  ? "Submitting…"
                  : hasExisting
                  ? "Update My Availability"
                  : "Submit My Availability"}
              </button>
            </>
          )}
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Results Zone */}
        <div className="space-y-8">
          <div>
            <SectionLabel>Results</SectionLabel>
            <ResultsSummary poll={poll} />
          </div>

          <div>
            <SectionLabel>Ranked Timeslots</SectionLabel>
            <RankedSlots poll={poll} />
          </div>

          <div>
            <SectionLabel>All Responses</SectionLabel>
            <ParticipantMatrix poll={poll} />
          </div>
        </div>
      </div>
    </div>
  );
}
