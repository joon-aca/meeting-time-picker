interface PollHeaderProps {
  title: string;
  description: string;
  timezone: string;
}

export function PollHeader({ title, description, timezone }: PollHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-10 text-center text-primary-foreground shadow-lg sm:p-14">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative space-y-5">
        <span className="inline-block rounded-full border border-white/10 bg-white/15 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
          Scheduling Poll
        </span>
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto max-w-lg font-serif text-base italic leading-relaxed text-white/80 sm:text-lg">
          {description}
        </p>
        <p className="pt-1 text-[11px] uppercase tracking-[0.15em] text-white/50">Poll base timezone: {timezone}</p>
      </div>
    </div>
  );
}
