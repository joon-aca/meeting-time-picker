export default function NotFound() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Poll Not Found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The requested scheduling poll could not be found.
        </p>
      </div>
    </main>
  );
}
