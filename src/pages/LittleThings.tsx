import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";
import { LilyDivider } from "@/components/floral/Lily";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/surface";
import { dailyByType } from "@/content/daily";
import type { DailyType } from "@/types";
import { cn } from "@/lib/utils";

const filters: { id: "all" | DailyType; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "note", label: "Notes" },
  { id: "affirmation", label: "For you" },
  { id: "prompt", label: "Prompts" },
  { id: "discovery", label: "Discoveries" },
];

const labels: Record<DailyType, string> = {
  note: "A note from Papi",
  affirmation: "For you",
  prompt: "Something to think about",
  discovery: "A small discovery",
};

export default function LittleThings() {
  const [filter, setFilter] = useState<"all" | DailyType>("all");

  const items = useMemo(() => {
    return (["note", "affirmation", "prompt", "discovery"] as DailyType[]).flatMap((type) =>
      dailyByType(type).map((item) => ({ ...item, type })),
    );
  }, []);

  const visible = filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <div>
      <PageHeader
        eyebrow="Little things"
        title="Small things, said properly."
        intro="Notes I've left here for you. Read one, read all of them, or pick the one that sounds like today."
        aside={
          <Link to="/my-space/notes" className={buttonVariants({ variant: "secondary", size: "md" })}>
            <PenLine className="h-4 w-4" />
            Write your own
          </Link>
        }
      />

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[0.76rem] transition-colors",
              filter === item.id
                ? "border-rose-deep bg-rose-deep text-on-accent"
                : "border-line bg-surface text-ink-muted hover:border-rose-soft hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((item, index) => (
          <Reveal key={item.id} delay={Math.min(index * 0.03, 0.2)} className="mb-4 break-inside-avoid">
            <article
              className={cn(
                "rounded-xl2 border p-6 transition-colors",
                item.type === "note"
                  ? "border-line bg-surface hover:border-rose-soft"
                  : item.type === "affirmation"
                    ? "border-rose-soft/50 bg-blush/45"
                    : "border-line bg-canvas",
              )}
            >
              <p className="eyebrow">{labels[item.type]}</p>
              <p
                className={cn(
                  "mt-3 text-pretty font-display text-[1.42rem] leading-[1.32] text-ink",
                  item.type === "affirmation" && "italic text-rose-deep",
                )}
              >
                {item.body}
              </p>
              {item.type === "note" ? (
                <p className="mt-4 font-display text-base italic text-ink-muted">— Papi</p>
              ) : null}
              {item.type === "prompt" ? (
                <Link
                  to="/my-space/notes"
                  className="mt-4 inline-block text-[0.74rem] font-medium text-rose-deep underline decoration-line underline-offset-4"
                >
                  Answer it
                </Link>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 text-center">
        <LilyDivider />
        <p className="mx-auto mt-6 max-w-md font-display text-xl italic leading-snug text-ink-muted">
          There's a new one of these on the home page every morning.
        </p>
        <Link to="/" className="mt-3 inline-block text-[0.8rem] font-medium text-rose-deep">
          Go and see today's
        </Link>
      </div>

      <Chip className="mt-10 block w-fit mx-auto">{visible.length} little things</Chip>
    </div>
  );
}
