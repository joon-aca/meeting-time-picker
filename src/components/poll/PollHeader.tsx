interface PollHeaderProps {
  title: string;
  description: string;
  timezone: string;
}

export function PollHeader({ title, description, timezone }: PollHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-10 sm:p-14 text-primary-foreground shadow-lg text-center">
      {/* Decorative elements */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative space-y-5">
        <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
          📅 Scheduling Poll
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.1] tracking-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg font-serif text-white/80 leading-relaxed max-w-lg mx-auto italic">
          {description}
        </p>
        <p className="text-[11px] text-white/50 tracking-[0.15em] uppercase pt-1">
          🌐 {timezone}
        </p>
      </div>
    </div>
  );
}
