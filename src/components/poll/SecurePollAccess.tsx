import { PollHeader } from "@/components/poll/PollHeader";

interface SecurePollAccessProps {
  title: string;
  description: string;
  timezone: string;
  status: "none" | "invalid";
}

export function SecurePollAccess({ title, description, timezone, status }: SecurePollAccessProps) {
  const isInvalid = status === "invalid";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-poll space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <PollHeader title={title} description={description} timezone={timezone} />

        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Invite Link Required
            </span>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {isInvalid ? "That invite link does not look right" : "Use your personal invite link to continue"}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {isInvalid
                  ? "The invite code in this URL does not match this poll. It may be incomplete, from an older copy, or pasted with a typo."
                  : "This poll is only open through personal invite links. Open the link that was sent to you and the page will unlock automatically."}
              </p>
            </div>

            <div
              className={`rounded-xl border px-5 py-4 text-sm ${
                isInvalid ? "border-amber-300 bg-amber-50 text-amber-900" : "border-border bg-secondary/70 text-foreground"
              }`}
            >
              <p className="font-medium">{isInvalid ? "Quick checks" : "What to do"}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {isInvalid ? (
                  <>
                    <li>Make sure you opened the full link with no missing characters at the end.</li>
                    <li>Try opening the link directly from the original message instead of copying it by hand.</li>
                    <li>If it still fails, ask the organizer to resend your invite link.</li>
                  </>
                ) : (
                  <>
                    <li>Open the exact invite link sent to you by the organizer.</li>
                    <li>Your link will open the poll under your name automatically.</li>
                    <li>If you cannot find it, ask the organizer to resend it.</li>
                  </>
                )}
              </ul>
            </div>

            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              This page stays locked unless a valid invite code is present.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
