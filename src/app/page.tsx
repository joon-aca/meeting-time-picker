import { redirect } from "next/navigation";
import { getDefaultPollSlug } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let slug: string | null = null;

  try {
    slug = await getDefaultPollSlug();
  } catch {
    // Fall through to setup instructions when the database has not been migrated yet.
  }

  if (slug) {
    redirect(`/poll/${slug}`);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Meeting Time Picker</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Run the database setup before opening the poll.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-lg bg-secondary p-4 text-sm text-foreground">
{`npm install\nnpx prisma migrate dev --name init\nnpm run prisma:seed\nnpm run dev`}
        </pre>
      </div>
    </main>
  );
}
