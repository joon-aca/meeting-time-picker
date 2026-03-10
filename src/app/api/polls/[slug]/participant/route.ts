import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getParticipantByName, saveParticipantVotes } from "@/lib/polls";
import { participantNameSchema } from "@/lib/poll-schemas";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const name = participantNameSchema.parse(searchParams.get("name") ?? "");
    const participant = await getParticipantByName(slug, name);

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    return NextResponse.json({ participant });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to load participant" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const payload = await request.json();
    const result = await saveParticipantVotes(slug, payload);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }

    if (error instanceof Error) {
      const status = error.message === "Poll not found" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: "Unable to save participant votes" }, { status: 500 });
  }
}
