import { NextResponse } from "next/server";
import { getPollBySlug } from "@/lib/polls";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const poll = await getPollBySlug(slug);

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  return NextResponse.json({ poll });
}
