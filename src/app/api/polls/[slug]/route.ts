import { NextResponse } from "next/server";
import { getPollBySlug } from "@/lib/polls";
import { resolveInviteeNameFromToken } from "@/lib/invite-tokens";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const poll = await getPollBySlug(slug);

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const inviteToken = new URL(request.url).searchParams.get("invite") ?? "";
  if (poll.accessMode !== "SHARED" && !resolveInviteeNameFromToken(slug, inviteToken, poll.invitees.map((invitee) => invitee.name))) {
    return NextResponse.json({ error: "Valid invite code required" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ poll }, { headers: { "Cache-Control": "no-store" } });
}
