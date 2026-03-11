import { notFound } from "next/navigation";
import { PollPageClient } from "@/components/poll/PollPageClient";
import { verifyInviteToken } from "@/lib/invite-tokens";
import { getPollBySlug } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function PollPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { slug } = await params;
  const { invite } = await searchParams;
  const poll = await getPollBySlug(slug);

  if (!poll) {
    notFound();
  }

  const tokenName = invite ? verifyInviteToken(slug, invite) : null;
  const lockedInvitee = tokenName ? poll.invitees.find((invitee) => invitee.name === tokenName) : null;
  const inviteTokenStatus = !invite ? "none" : lockedInvitee ? "valid" : "invalid";

  return (
    <PollPageClient
      initialPoll={poll}
      lockedInviteeName={lockedInvitee?.name ?? null}
      inviteToken={lockedInvitee ? invite ?? null : null}
      inviteTokenStatus={inviteTokenStatus}
    />
  );
}
