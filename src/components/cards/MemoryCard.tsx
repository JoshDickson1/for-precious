import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Lily } from "@/components/floral/Lily";
import type { Memory } from "@/types";
import { memoryDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const categoryLabel: Record<Memory["category"], string> = {
  beginning: "The beginning",
  us: "Us",
  firsts: "Firsts",
  later: "Still ahead",
};

export function MemoryPlate({ memory, className }: { memory: Memory; className?: string }) {
  const date = memoryDate(memory.date, memory.datePrecision);
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-xl2 border border-line/80 bg-gradient-to-br from-blush via-[#170A11] to-[#0B0509]",
        className,
      )}
    >
      {memory.cover?.type === "image" ? (
        <img
          src={memory.cover.src}
          alt={memory.cover.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-silk group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Lily size={210} className="opacity-70 transition-transform duration-700 ease-silk group-hover:rotate-3 group-hover:scale-[1.02]" />
          <span className="absolute right-4 top-3 font-display text-[0.95rem] italic text-rose-deep/70">
            {String(memory.order).padStart(2, "0")}
          </span>
          {date ? (
            <span className="absolute bottom-4 left-5 font-sans text-[0.6rem] uppercase tracking-[0.24em] text-ink-muted">
              {date}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function MemoryCard({ memory, compact = false }: { memory: Memory; compact?: boolean }) {
  const date = memoryDate(memory.date, memory.datePrecision);

  return (
    <Link
      to={`/our-story/${memory.slug}`}
      className="group block focus-visible:rounded-xl2"
      aria-label={`Read: ${memory.title}`}
    >
      <MemoryPlate memory={memory} className={compact ? "aspect-[5/4]" : "aspect-[4/3]"} />
      <div className="pt-4">
        <p className="eyebrow mb-1.5">{date ?? categoryLabel[memory.category]}</p>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.45rem] leading-tight text-ink transition-colors group-hover:text-rose-deep">
            {memory.title}
          </h3>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rose-deep" />
        </div>
        <p className="mt-2 line-clamp-2 text-[0.86rem] leading-relaxed text-ink-muted">{memory.summary}</p>
      </div>
    </Link>
  );
}
