import type { ReactNode } from "react";
import { LilyMark } from "@/components/floral/Lily";
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
    <header className={cn("border-b border-line pb-10 pt-14 sm:pb-14 sm:pt-20", className)}>
      <div className="flex flex-wrap items-end justify-between gap-8">
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
