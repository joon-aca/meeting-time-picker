interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <h2 className="mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-3">
      <span>{children}</span>
      <span className="flex-1 h-px bg-border" />
    </h2>
  );
}
