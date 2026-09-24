import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { PollPageClient } from "@/components/poll/PollPageClient";
import { SecurePollAccess } from "@/components/poll/SecurePollAccess";
import { resolveInviteeNameFromToken } from "@/lib/invite-tokens";
import { getPollBySlug } from "@/lib/polls";
import { getTimeZoneDisplayLabel } from "@/lib/poll-utils";
import { parseRememberedName, rememberedNameCookieKey } from "@/lib/remembered-name";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

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

  if (poll.accessMode === "SHARED") {
    const cookieStore = await cookies();
    const rememberedName = parseRememberedName(cookieStore.get(rememberedNameCookieKey())?.value);

    return (
      <PollPageClient
        initialPoll={poll}
        lockedInviteeName={null}
        adminInviteeName={null}
        inviteToken={null}
        rememberedName={rememberedName}
      />
    );
  }

  const tokenName = invite ? resolveInviteeNameFromToken(slug, invite, poll.invitees.map((invitee) => invitee.name)) : null;
  const lockedInvitee = tokenName ? poll.invitees.find((invitee) => invitee.name === tokenName) : null;
  const adminInviteeName = lockedInvitee?.isAdmin ? lockedInvitee.name : null;
  const inviteTokenStatus = !invite ? "none" : lockedInvitee ? "valid" : "invalid";

  if (inviteTokenStatus !== "valid") {
    return (
      <SecurePollAccess
        slug={slug}
        title={poll.title}
        description={poll.description}
        timezone={getTimeZoneDisplayLabel(poll.timezone, poll.timeslots[0]?.date, poll.timeslots[0]?.startTime)}
        status={inviteTokenStatus}
        initialInviteToken={invite ?? ""}
      />
    );
  }

  return (
    <PollPageClient
      initialPoll={poll}
      lockedInviteeName={adminInviteeName ? null : lockedInvitee?.name ?? null}
      adminInviteeName={adminInviteeName}
      inviteToken={lockedInvitee ? invite ?? null : null}
    />
  );
}
