interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{children}</h2>;
}
