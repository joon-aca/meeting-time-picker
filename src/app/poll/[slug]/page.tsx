import { notFound } from "next/navigation";
import { PollPageClient } from "@/components/poll/PollPageClient";
import { getPollBySlug } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function PollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poll = await getPollBySlug(slug);

  if (!poll) {
    notFound();
  }

  return <PollPageClient initialPoll={poll} />;
}
