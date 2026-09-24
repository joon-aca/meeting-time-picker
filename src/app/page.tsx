export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-display font-bold">Meeting Time Picker</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Open the meeting link from your invitation to choose times that work for you.
        </p>
      </div>
    </main>
  );
}
