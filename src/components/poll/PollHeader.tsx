interface PollHeaderProps {
  title: string;
  description: string;
  timezone: string;
}

export function PollHeader({ title, description, timezone }: PollHeaderProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display leading-tight">
        {title}
      </h1>
      <p className="text-base font-serif text-foreground/80 leading-relaxed">
        {description}
      </p>
      <p className="text-xs text-muted-foreground tracking-wide uppercase">
        {timezone}
      </p>
    </div>
  );
}
