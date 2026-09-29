import { Calendar } from "lucide-react";

interface SiteGateProps {
  eyebrow: string;
  title: string;
  message: string;
  detail: string;
}

export function SiteGate({ eyebrow, title, message, detail }: SiteGateProps) {
  const words = title.split(" ");

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-foreground text-primary-foreground">
      <div className="pointer-events-none absolute left-[-10%] top-[-30%] h-[60vw] w-[60vw] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[50vw] w-[50vw] rounded-full bg-accent/15 blur-[100px]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-display font-semibold tracking-tight opacity-80">Meeting Time Picker</span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.2em] opacity-40">{eyebrow}</span>
      </header>

      <div className="relative z-10 flex flex-1 items-center px-6 pb-16 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="text-[clamp(2.75rem,8vw,6.5rem)] font-display font-bold leading-[0.9] tracking-[-0.03em]">
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className={index % 2 === 1 ? "text-primary" : undefined}>
                {word}{" "}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-xl font-serif text-lg italic leading-relaxed opacity-70 sm:text-xl">{message}</p>
          <div className="mt-12 h-px origin-left bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.15em] opacity-30">{detail}</p>
        </div>
      </div>
    </main>
  );
}
