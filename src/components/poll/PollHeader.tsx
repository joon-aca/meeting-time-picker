interface PollHeaderProps {
  title: string;
  description: string;
  timezone: string;
}

export function PollHeader({ title, description, timezone }: PollHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-8 sm:p-10 text-primary-foreground shadow-lg">
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5 blur-3xl" />

      <div className="relative space-y-3">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
          📅 Scheduling Poll
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight drop-shadow-sm">
          {title}
        </h1>
        <p className="text-base sm:text-lg font-serif text-white/85 leading-relaxed max-w-xl">
          {description}
        </p>
        <p className="text-xs text-white/60 tracking-wide uppercase pt-1">
          {timezone}
        </p>
      </div>
    </div>
  );
}
