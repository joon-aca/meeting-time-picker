"use client";

import { FormEvent, useState } from "react";
import { ShieldAlert, Link2, Mail, MousePointerClick, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface SecurePollAccessProps {
  slug: string;
  title: string;
  description: string;
  timezone: string;
  status: "none" | "invalid";
  initialInviteToken: string;
}

export function SecurePollAccess({ slug, title, description, timezone, status, initialInviteToken }: SecurePollAccessProps) {
  const router = useRouter();
  const isInvalid = status === "invalid";
  const [token, setToken] = useState(initialInviteToken);
  const [tokenError, setTokenError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setTokenError("Enter your invite code to continue.");
      return;
    }

    setTokenError("");
    router.push(`/poll/${slug}?invite=${encodeURIComponent(trimmedToken)}`);
  };

  const steps = isInvalid
    ? [
        { icon: Link2, text: "Check that the code is complete." },
        { icon: Mail, text: "If needed, ask for a fresh link." },
      ]
    : [
        { icon: MousePointerClick, text: "Enter the invite code from your message." },
        { icon: Link2, text: "Or open the full link you were sent." },
      ];

  return (
    <div className="min-h-screen bg-foreground text-primary-foreground relative overflow-hidden flex flex-col">
      {/* Ambient glow effects */}
      <div className="absolute top-[-30%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-display font-semibold tracking-tight opacity-80">
            ACA Board
          </span>
        </div>
        <span className="text-[11px] tracking-[0.2em] uppercase opacity-40">
          {timezone}
        </span>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10 pb-16">
        <div className="max-w-3xl w-full">
          {/* Giant title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12 sm:mb-16"
          >
            <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-display font-bold leading-[0.9] tracking-[-0.03em]">
              {title.split(" ").map((word, i) => (
                <span
                  key={i}
                  className={i % 2 === 1 ? "text-primary" : ""}
                >
                  {word}{" "}
                </span>
              ))}
            </h1>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left: status message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
                  <ShieldAlert className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase opacity-40">Status</p>
                  <p className="text-base font-display font-semibold">
                    {isInvalid ? "Invalid Link" : "Invite Required"}
                  </p>
                </div>
              </div>

              <p className="text-lg sm:text-xl font-serif italic leading-relaxed opacity-70">
                {isInvalid
                  ? "That invite link doesn't look right. It may be incomplete or from an older copy."
                  : "This poll is invite-only. Paste your personal invite code below or open the full link that was sent to you."}
              </p>

              <p className="text-xs opacity-30 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                This page stays locked without a valid invite code.
              </p>
            </motion.div>

            {/* Right: steps */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-40 mb-6">
                {isInvalid ? "Quick checks" : "What to do"}
              </p>
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                    className="flex items-center gap-4 group"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                      <step.icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <div className="flex min-h-10 flex-col justify-center">
                      <span className="text-[11px] font-display font-semibold tracking-[0.15em] uppercase opacity-30 block mb-1">
                        Option {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                        {step.text}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-10 flex justify-center"
          >
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 sm:p-5">
              <label htmlFor="invite-token" className="block text-center text-[11px] font-semibold uppercase tracking-[0.18em] opacity-50">
                Invite Code
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  id="invite-token"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={token}
                  onChange={(event) => {
                    setToken(event.target.value);
                    if (tokenError) {
                      setTokenError("");
                    }
                  }}
                  placeholder="Name-ABC123"
                  className="min-h-12 min-w-0 flex-1 appearance-none rounded-xl border border-primary-foreground/15 bg-black/15 px-4 py-3 text-lg leading-normal text-primary-foreground placeholder:text-primary-foreground/35 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  className="h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/0.25)] transition-opacity hover:opacity-90 sm:min-w-[8rem]"
                >
                  Open Poll
                </button>
              </div>
              {tokenError ? <p className="text-center text-sm text-amber-200">{tokenError}</p> : null}
              <p className="text-center text-xs opacity-45">
                {isInvalid ? "Paste the code again and retry." : "You can also open the full invite URL directly."}
              </p>
            </form>
          </motion.div>

          {/* Bottom decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 sm:mt-20 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent origin-left"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-6 text-[11px] tracking-[0.15em] uppercase opacity-30 text-center"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
