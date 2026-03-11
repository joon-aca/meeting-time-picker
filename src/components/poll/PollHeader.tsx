"use client";

import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface PollHeaderProps {
  title: string;
  description: string;
  timezone: string;
}

export function PollHeader({ title, description, timezone }: PollHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-12">
      {/* Subtle ambient glows */}
      <div className="absolute top-[-60%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/6 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-50%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[60px] pointer-events-none" />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-between mb-7"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            Scheduling Poll
          </span>
        </div>
        <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/60">{timezone}</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative text-[clamp(1.75rem,4.5vw,3.5rem)] font-display font-bold leading-[0.95] tracking-[-0.03em] text-foreground"
      >
        {title.split(" ").map((word, i) => (
          <span key={i} className={i % 2 === 1 ? "text-primary" : ""}>
            {word}{" "}
          </span>
        ))}
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="relative mt-4 font-serif italic text-base leading-relaxed text-muted-foreground max-w-lg"
      >
        {description}
      </motion.p>

      {/* Bottom rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative mt-7 h-px bg-gradient-to-r from-primary/30 via-accent/20 to-transparent origin-left"
      />
    </div>
  );
}
