import type { ReactNode } from "react";
import { Lily, LilyMark } from "@/components/floral/Lily";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  intro,
  aside,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative border-b border-line pb-10 pt-14 sm:pb-14 sm:pt-20", className)}>
      <Lily
        size={180}
        tone="line"
        strokeWidth={2}
        animated
        className="pointer-events-none absolute -top-6 right-0 hidden h-40 w-40 -translate-y-2 translate-x-6 text-rose-soft/30 sm:block lg:h-48 lg:w-48"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3 text-rose">
            <LilyMark className="h-4 w-4" />
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          </div>
          <h1 className="font-display text-display-lg text-balance text-ink">{title}</h1>
          {intro ? (
            <p className="mt-5 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-ink-muted">{intro}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6">
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="font-display text-display-md text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}
