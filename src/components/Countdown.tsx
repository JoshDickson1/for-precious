import { useEffect, useState } from "react";
import { LilyMark } from "@/components/floral/Lily";
import { site } from "@/config/site";
import { countdownTo, pad2 } from "@/lib/date";

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center px-2">
      <span className="font-display text-[clamp(2rem,7vw,3rem)] font-medium tabular-nums leading-none text-ink">
        {value}
      </span>
      <span className="mt-2 font-sans text-[0.6rem] uppercase tracking-[0.22em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [parts, setParts] = useState(() =>
    countdownTo(site.countdown.targetAt),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setParts(countdownTo(site.countdown.targetAt));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      aria-label="Countdown"
      className="relative overflow-hidden rounded-xl2 border border-line bg-surface px-5 py-9 shadow-soft sm:px-10"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]">
        <LilyMark className="h-56 w-56 text-rose-deep" />
      </div>
      <div className="relative flex flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-3 text-rose">
          <LilyMark className="h-3.5 w-3.5" />
          <span className="eyebrow">Two months</span>
          <LilyMark className="h-3.5 w-3.5" />
        </div>

        {parts.done ? (
          <div>
            <p className="font-display text-display-md text-ink">It's time.</p>
            <p className="mt-2 text-sm text-ink-muted">
              Ask me what it was for.
            </p>
          </div>
        ) : (
          <div className="flex w-full max-w-lg items-stretch justify-center divide-x divide-line/80">
            <Tile value={String(parts.days)} label="days" />
            <Tile value={pad2(parts.hours)} label="hours" />
            <Tile value={pad2(parts.minutes)} label="minutes" />
            <Tile value={pad2(parts.seconds)} label="seconds" />
          </div>
        )}

        <p className="mt-7 max-w-xs text-[0.8rem] italic leading-relaxed text-ink-muted">
          {parts.done
            ? "You never asked what this was counting. I noticed."
            : site.countdown.caption}
        </p>
      </div>
    </section>
  );
}
