import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getParticipantByName, getPollBySlug, saveParticipantVotes } from "@/lib/polls";
import { participantNameSchema } from "@/lib/poll-schemas";
import { resolveInviteeNameFromToken } from "@/lib/invite-tokens";
import { enforceRateLimit, getClientIp, hasJsonContentType, isPayloadTooLarge, isSameOriginRequest } from "@/lib/security";

const API_RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

function jsonResponse(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...API_RESPONSE_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const clientIp = getClientIp(request);
    const rateLimit = enforceRateLimit(`participant-get:${slug}:${clientIp}`, 120);

    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
          },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const name = participantNameSchema.parse(searchParams.get("name") ?? "");
    const poll = await getPollBySlug(slug);
    if (!poll) {
      return jsonResponse({ error: "Poll not found" }, { status: 404 });
    }

    const inviteeName = resolveInviteeNameFromToken(
      slug,
      searchParams.get("invite") ?? "",
      poll.invitees.map((invitee) => invitee.name),
    );
    const invitee = poll.invitees.find((candidate) => candidate.name === inviteeName);
    if (!invitee || (!invitee.isAdmin && invitee.name !== name)) {
      return jsonResponse({ error: "Valid invite code required" }, { status: 403 });
    }
    const participant = await getParticipantByName(slug, name);

    if (!participant) {
      return jsonResponse({ error: "Participant not found" }, { status: 404 });
    }

    return jsonResponse({ participant });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ error: error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }

    return jsonResponse({ error: "Unable to load participant" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const clientIp = getClientIp(request);
    const rateLimit = enforceRateLimit(`participant-put:${slug}:${clientIp}`, 40);

    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
          },
        },
      );
    }

    if (!isSameOriginRequest(request)) {
      return jsonResponse({ error: "Cross-origin form submission is not allowed" }, { status: 403 });
    }

    if (!hasJsonContentType(request)) {
      return jsonResponse({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    if (isPayloadTooLarge(request, 20 * 1024)) {
      return jsonResponse({ error: "Payload too large" }, { status: 413 });
    }

    const payload = await request.json();
    const result = await saveParticipantVotes(slug, payload);

    return jsonResponse(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ error: error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }

    if (error instanceof Error) {
      const status = error.message === "Poll not found" ? 404 : 400;
      return jsonResponse({ error: error.message }, { status });
    }

    return jsonResponse({ error: "Unable to save participant votes" }, { status: 500 });
  }
}
