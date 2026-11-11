import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MemoryPlate } from "@/components/cards/MemoryCard";
import { LilyGarland } from "@/components/floral/LilyGarland";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { publishedMemories } from "@/content/memories";
import { memoryDate } from "@/lib/date";
import type { Memory } from "@/types";

const categoryLabel: Record<Memory["category"], string> = {
  beginning: "The beginning",
  us: "Us",
  firsts: "Firsts",
  later: "Still ahead",
};

export default function Story() {
  return (
    <div>
      <PageHeader
        eyebrow="Our story"
        title="Everything that led to you."
        intro="No dramatisation, no invented details. Just the parts I can point at — and a few I'm still writing down."
        aside={
          <div className="text-right">
            <p className="font-display text-4xl italic text-rose-deep/80">
              {String(publishedMemories.length).padStart(2, "0")}
              <span className="ml-2 font-sans text-[0.6rem] uppercase tracking-[0.22em] text-ink-muted">
                chapters
              </span>
            </p>
            <p className="mt-1 font-script text-xl text-rose-soft/80">
              and counting
            </p>
          </div>
        }
      />

      <ol className="mt-4">
        {publishedMemories.map((memory, index) => {
          const date = memoryDate(memory.date, memory.datePrecision);
          return (
            <Reveal key={memory.slug} delay={Math.min(index * 0.05, 0.25)}>
              <li className="group grid gap-5 border-b border-line py-9 sm:grid-cols-[110px_1fr] sm:gap-8 lg:grid-cols-[110px_1fr_220px] lg:items-center">
                <div className="flex items-baseline gap-3 sm:block">
                  <p className="font-display text-[2.4rem] leading-none text-rose-soft transition-colors group-hover:text-rose">
                    {String(memory.order).padStart(2, "0")}
                  </p>
                  <p className="eyebrow sm:mt-2">
                    {date ?? categoryLabel[memory.category]}
                  </p>
                </div>

                <div className="max-w-xl">
                  <Link
                    to={`/our-story/${memory.slug}`}
                    className="inline-block"
                  >
                    <h2 className="font-display text-[1.9rem] leading-tight text-ink transition-colors group-hover:text-rose-deep sm:text-[2.2rem]">
                      {memory.title}
                    </h2>
                  </Link>
                  <p className="mt-2.5 text-pretty text-[0.92rem] leading-relaxed text-ink-muted">
                    {memory.summary}
                  </p>
                  <Link
                    to={`/our-story/${memory.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-rose-deep"
                  >
                    Read the chapter
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

                <Link
                  to={`/our-story/${memory.slug}`}
                  className="hidden lg:block"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <MemoryPlate memory={memory} className="aspect-[5/4]" />
                </Link>
              </li>
            </Reveal>
          );
        })}
      </ol>

      <Reveal className="mt-16">
        <div className="rounded-xl2 border border-line bg-surface p-7 text-center sm:p-10">
          <LilyGarland caption="every chapter, still you" />
          <h2 className="mt-6 font-display text-display-md text-balance text-ink">
            That's everything I've written down so far.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-relaxed text-ink-muted">
            There's one more page. I'd rather you found it yourself than have me
            hand it to you.
          </p>
          <Link
            to="/our-question"
            className={buttonVariants({
              variant: "secondary",
              size: "md",
              className: "mt-6",
            })}
          >
            I think I found it
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
