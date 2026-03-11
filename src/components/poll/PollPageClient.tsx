"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Participant, Poll, Vote, VoteValue } from "@/lib/poll-types";
import { ParticipantMatrix } from "@/components/poll/ParticipantMatrix";
import { PollHeader } from "@/components/poll/PollHeader";
import { RankedSlots } from "@/components/poll/RankedSlots";
import { ResultsSummary } from "@/components/poll/ResultsSummary";
import { SectionLabel } from "@/components/poll/SectionLabel";
import { VotingMatrix } from "@/components/poll/VotingMatrix";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import { getTimeslotDisplayMeta, getTimeZoneDisplayLabel } from "@/lib/poll-utils";

interface PollPageClientProps {
  initialPoll: Poll;
  lockedInviteeName: string | null;
  inviteToken: string | null;
}

type PollPageState = "idle" | "loading" | "loaded" | "submitting" | "success" | "error";
type Feedback = { kind: "success" | "info" | "error"; message: string } | null;

export function PollPageClient({ initialPoll, lockedInviteeName, inviteToken }: PollPageClientProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [state, setState] = useState<PollPageState>("idle");
  const [participantName, setParticipantName] = useState("");
  const [votes, setVotes] = useState<Vote[]>([]);
  const [nameError, setNameError] = useState("");
  const [hasExisting, setHasExisting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  const participantEndpoint = `/api/polls/${poll.slug}/participant`;
  const storageKey = `meeting-time-picker:selected-name:v2:${poll.slug}`;
  const legacyStorageKey = `meeting-time-picker:selected-name:${poll.slug}`;
  const normalizedName = participantName.trim();
  const hasLockedInvitee = Boolean(lockedInviteeName);
  const matchedInvitee = poll.invitees.find((invitee) => invitee.name === normalizedName);
  const activeTimeZone = matchedInvitee?.timeZone ?? poll.timezone;
  const activeTimeZoneLabel =
    matchedInvitee?.timeZoneLabel ??
    getTimeZoneDisplayLabel(poll.timezone, poll.timeslots[0]?.date, poll.timeslots[0]?.startTime);
  const sortedInvitees = useMemo(() => {
    const submittedNames = new Set(poll.participants.map((participant) => participant.name));

    return [...poll.invitees].sort((left, right) => {
      const leftSubmitted = submittedNames.has(left.name);
      const rightSubmitted = submittedNames.has(right.name);

      if (leftSubmitted !== rightSubmitted) {
        return leftSubmitted ? 1 : -1;
      }

      return left.name.localeCompare(right.name);
    });
  }, [poll.invitees, poll.participants]);
  const unsubmittedInvitees = useMemo(
    () => sortedInvitees.filter((invitee) => !poll.participants.some((participant) => participant.name === invitee.name)),
    [poll.participants, sortedInvitees],
  );
  const submittedInvitees = useMemo(
    () => sortedInvitees.filter((invitee) => poll.participants.some((participant) => participant.name === invitee.name)),
    [poll.participants, sortedInvitees],
  );
  const weekSlotIds = useMemo(() => {
    const groupedWeeks = Array.from(
      poll.timeslots.reduce<Map<string, string[]>>((map, timeslot) => {
        const { weekKey } = getTimeslotDisplayMeta(timeslot, poll.timezone, poll.timezone);
        const existing = map.get(weekKey);

        if (existing) {
          existing.push(timeslot.id);
          return map;
        }

        map.set(weekKey, [timeslot.id]);
        return map;
      }, new Map()),
    );

    return groupedWeeks.map(([, slotIds]) => slotIds);
  }, [poll.timeslots, poll.timezone]);
  const shouldAlwaysShowSecondWeek = useMemo(() => {
    const [firstWeekSlotIds, secondWeekSlotIds] = weekSlotIds;

    if (!firstWeekSlotIds || !secondWeekSlotIds) {
      return false;
    }

    return poll.participants.some((participant) => {
      const participantVoteMap = new Map(participant.votes.map((vote) => [vote.timeslotId, vote.value]));
      const hasFirstWeekYes = firstWeekSlotIds.some((timeslotId) => participantVoteMap.get(timeslotId) === "YES");
      const hasSecondWeekYes = secondWeekSlotIds.some((timeslotId) => participantVoteMap.get(timeslotId) === "YES");

      return !hasFirstWeekYes && hasSecondWeekYes;
    });
  }, [poll.participants, weekSlotIds]);

  const handleVoteChange = (timeslotId: string, value: VoteValue) => {
    setVotes((previous) => {
      const filtered = previous.filter((vote) => vote.timeslotId !== timeslotId);

      if (value === "NO") {
        return filtered;
      }

      return [...filtered, { timeslotId, value }];
    });
  };

  const applyLoadedParticipant = (participant: Pick<Participant, "votes">) => {
    setVotes(participant.votes.filter((vote) => vote.value !== "NO"));
    setHasExisting(true);
  };

  const hydrateParticipantSelection = useCallback((selectedName: string) => {
    setNameError("");
    setFeedback(null);
    setState("loaded");

    const existingParticipant = poll.participants.find((participant) => participant.name === selectedName);
    if (existingParticipant) {
      applyLoadedParticipant(existingParticipant);
      return;
    }

    setVotes([]);
    setHasExisting(false);
  }, [poll.participants]);

  const handleParticipantSelection = (selectedName: string) => {
    if (hasLockedInvitee) {
      return;
    }

    setParticipantName(selectedName);
    setNameError("");
    setFeedback(null);

    if (typeof window !== "undefined") {
      if (selectedName) {
        window.localStorage.setItem(storageKey, selectedName);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    }

    if (!selectedName) {
      setVotes([]);
      setHasExisting(false);
      setState("idle");
      return;
    }

    hydrateParticipantSelection(selectedName);
  };

  useEffect(() => {
    if (hasLockedInvitee && lockedInviteeName) {
      setParticipantName(lockedInviteeName);
      hydrateParticipantSelection(lockedInviteeName);
      setHasInitializedSelection(true);
      return;
    }

    if (hasInitializedSelection || typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(legacyStorageKey);
    const storedName = window.localStorage.getItem(storageKey);
    if (storedName && poll.invitees.some((invitee) => invitee.name === storedName)) {
      setParticipantName(storedName);
      hydrateParticipantSelection(storedName);
    }

    setHasInitializedSelection(true);
  }, [hasInitializedSelection, hasLockedInvitee, hydrateParticipantSelection, legacyStorageKey, lockedInviteeName, poll.invitees, storageKey]);

  const handleSubmit = async () => {
    const trimmedName = participantName.trim();

    if (!trimmedName) {
      setNameError("Please select your name");
      return;
    }

    if (votes.length === 0) {
      setNameError("Select at least one timeslot as maybe or yes");
      return;
    }

    setState("submitting");
    setNameError("");
    setFeedback(null);

    try {
      const response = await fetch(participantEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          inviteToken: inviteToken ?? undefined,
          votes: poll.timeslots.map((timeslot) => ({
            timeslotId: timeslot.id,
            value: votes.find((vote) => vote.timeslotId === timeslot.id)?.value ?? "NO",
          })),
        }),
      });

      const data = (await response.json()) as {
        poll?: Poll;
        participant?: Participant;
        mode?: "created" | "updated";
        error?: string;
      };

      if (!response.ok || !data.poll || !data.participant || !data.mode) {
        throw new Error(data.error ?? "Unable to save availability");
      }

      setPoll(data.poll);
      setVotes(data.participant.votes.filter((vote) => vote.value !== "NO"));
      setHasExisting(true);
      setFeedback({
        kind: "success",
        message: data.mode === "updated" ? "Your availability has been updated." : "Your availability has been submitted.",
      });
      setState("success");
    } catch (error) {
      setState("error");
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to save availability",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-poll space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <PollHeader
          title={poll.title}
          description={poll.description}
          timezone={getTimeZoneDisplayLabel(poll.timezone, poll.timeslots[0]?.date, poll.timeslots[0]?.startTime)}
        />

        <div className="space-y-6">
          <SectionLabel>Your Availability</SectionLabel>

          <div className="space-y-3">
            <div>
              {hasLockedInvitee && matchedInvitee ? (
                <div className="w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 sm:w-80">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Secure Invite Link</p>
                  <div className="mt-1 flex min-w-0 items-center justify-between gap-3 text-left">
                    <span className="truncate font-medium text-foreground">{matchedInvitee.name}</span>
                    <span className="flex-shrink-0 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {matchedInvitee.timeZoneLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <Select
                  value={participantName || undefined}
                  onValueChange={(value) => {
                    handleParticipantSelection(value);
                  }}
                  disabled={state === "submitting"}
                >
                  <SelectTrigger className="h-11 w-full rounded-lg bg-card sm:w-80">
                    {matchedInvitee ? (
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-4 text-left">
                        <span className="truncate text-foreground">{matchedInvitee.name}</span>
                        <span className="flex-shrink-0 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          {matchedInvitee.timeZoneLabel}
                        </span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">&lt;Please Select&gt;</div>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {unsubmittedInvitees.length > 0 ? (
                      <SelectGroup>
                        <SelectLabel>Available To Pick</SelectLabel>
                        {unsubmittedInvitees.map((invitee) => (
                          <SelectItem key={invitee.id} value={invitee.name}>
                            <span className="flex w-full items-center justify-between gap-3 pr-4">
                              <span>{invitee.name}</span>
                              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                {invitee.timeZoneLabel}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}

                    {submittedInvitees.length > 0 ? (
                      <>
                        {unsubmittedInvitees.length > 0 ? <SelectSeparator /> : null}
                        <SelectGroup>
                          <SelectLabel>Already Selected</SelectLabel>
                          {submittedInvitees.map((invitee) => (
                            <SelectItem key={invitee.id} value={invitee.name}>
                              <span className="flex w-full items-center justify-between gap-3 pr-4">
                                <span className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                  <span>{invitee.name}</span>
                                </span>
                                <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                  {invitee.timeZoneLabel}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    ) : null}
                  </SelectContent>
                </Select>
              )}
              {nameError ? <p className="mt-1.5 text-xs text-destructive animate-fade-in">{nameError}</p> : null}
            </div>
          </div>

          {matchedInvitee ? (
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Availability times currently shown in {activeTimeZoneLabel} for {matchedInvitee.name}
            </p>
          ) : (
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {"<Please Select>"} to remap the times into your local timezone
            </p>
          )}

          {matchedInvitee ? (
            <p className="text-xs text-muted-foreground">
              No click counts as no. First click is maybe, second click is yes.
            </p>
          ) : null}

          {feedback ? (
            <div
              className={`animate-fade-in rounded-lg border px-5 py-4 ${
                feedback.kind === "error"
                  ? "border-destructive bg-destructive/5"
                  : feedback.kind === "info"
                    ? "border-border bg-secondary"
                    : "border-primary bg-primary/5"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  feedback.kind === "error"
                    ? "text-destructive"
                    : feedback.kind === "info"
                      ? "text-foreground"
                      : "text-primary"
                }`}
              >
                {feedback.message}
              </p>
              {state === "success" ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Thank you, {participantName.trim()}!</p>
                  <button
                    type="button"
                    onClick={() => {
                      setState("loaded");
                      setFeedback(null);
                    }}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Edit
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {!matchedInvitee ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/60 px-5 py-6 text-sm text-muted-foreground">
              Choose your name above to see the meeting options in your timezone.
            </div>
          ) : state !== "success" ? (
            <>
              <VotingMatrix
                timeslots={poll.timeslots}
                votes={votes}
                onVoteChange={handleVoteChange}
                disabled={state === "submitting"}
                sourceTimeZone={poll.timezone}
                targetTimeZone={activeTimeZone}
                forceShowAllWeeks={shouldAlwaysShowSecondWeek}
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={state === "submitting"}
                className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {state === "submitting" ? "Submitting..." : hasExisting ? "Update My Availability" : "Submit My Availability"}
              </button>
            </>
          ) : null}
        </div>

        <hr className="border-border" />

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
            <ParticipantMatrix
              poll={poll}
              sourceTimeZone={poll.timezone}
              targetTimeZone={activeTimeZone}
              forceShowAllWeeks={shouldAlwaysShowSecondWeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
