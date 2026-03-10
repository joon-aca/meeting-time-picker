import { Poll, TimeslotTally, VoteValue } from "@/types/poll";

export function tallyVotes(poll: Poll): TimeslotTally[] {
  return poll.timeslots.map((timeslot) => {
    let yesCount = 0;
    let maybeCount = 0;
    let noCount = 0;

    poll.participants.forEach((p) => {
      const vote = p.votes.find((v) => v.timeslotId === timeslot.id);
      if (vote?.value === "yes") yesCount++;
      else if (vote?.value === "maybe") maybeCount++;
      else noCount++;
    });

    return {
      timeslot,
      yesCount,
      maybeCount,
      noCount,
      score: yesCount * 2 + maybeCount,
    };
  });
}

export function rankSlots(tallies: TimeslotTally[]): TimeslotTally[] {
  return [...tallies].sort((a, b) => b.score - a.score || b.yesCount - a.yesCount);
}

export function getVoteForSlot(
  votes: { timeslotId: string; value: VoteValue }[],
  timeslotId: string
): VoteValue | undefined {
  return votes.find((v) => v.timeslotId === timeslotId)?.value;
}
