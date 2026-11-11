import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LilyGarland } from "@/components/floral/LilyGarland";
import { Reveal } from "@/components/motion/Reveal";
import { getMemory, publishedMemories } from "@/content/memories";
import { memoryDate } from "@/lib/date";
import NotFound from "@/pages/NotFound";

const categoryLabel: Record<string, string> = {
  beginning: "The beginning",
  us: "Us",
  firsts: "Firsts",
  later: "Still ahead",
};

export default function Memory() {
  const { slug } = useParams();
  const memory = slug ? getMemory(slug) : undefined;

  if (!memory) return <NotFound />;

  const index = publishedMemories.findIndex((item) => item.slug === memory.slug);
  const previous = index > 0 ? publishedMemories[index - 1] : null;
  const next = index >= 0 && index < publishedMemories.length - 1 ? publishedMemories[index + 1] : null;
  const body =
    memory.body.length > 1 && memory.body[0].trim() === memory.summary.trim()
      ? memory.body.slice(1)
      : memory.body;

  return (
    <article className="pb-8">
      <div className="pt-10">
        <Link
          to="/our-story"
          className="inline-flex items-center gap-2 text-[0.78rem] text-ink-muted transition-colors hover:text-rose-deep"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All chapters
        </Link>
      </div>

      <header className="mx-auto mt-8 max-w-2xl text-center">
        <p className="eyebrow">
          {memoryDate(memory.date, memory.datePrecision) ?? categoryLabel[memory.category]}
          <span className="mx-2 text-rose-soft">·</span>
          Chapter {String(memory.order).padStart(2, "0")}
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.4rem,7vw,4rem)] leading-[1.02] text-balance text-ink">
          {memory.title}
        </h1>
        <p className="mx-auto mt-5 max-w-lg font-display text-xl italic leading-relaxed text-ink-muted">
          {memory.summary}
        </p>
      </header>

      <LilyGarland className="mt-10" caption="read it slowly" />

      <div className="mx-auto mt-10 max-w-xl">
        <div className="space-y-6">
          {body.map((paragraph, paragraphIndex) => (
            <Reveal key={paragraphIndex} delay={paragraphIndex * 0.04}>
              <p
                className={
                  paragraphIndex === 0
                    ? "text-pretty text-[1.02rem] leading-[1.85] text-ink/90 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[3.2rem] first-letter:leading-[0.82] first-letter:text-rose-deep"
                    : "text-pretty text-[1.02rem] leading-[1.85] text-ink/90"
                }
              >
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        {memory.media.length > 0 ? (
          <div className="mt-12 space-y-6">
            {memory.media.map((item) => (
              <figure key={item.src}>
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full rounded-xl2 border border-line object-cover"
                  />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    poster={item.poster}
                    className="w-full rounded-xl2 border border-line"
                  >
                    <source src={item.src} />
                    {item.alt}
                  </video>
                )}
                {item.caption ? (
                  <figcaption className="mt-2 text-center text-[0.76rem] text-ink-muted">{item.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}
      </div>

      <nav className="mx-auto mt-16 grid max-w-3xl gap-3 border-t border-line pt-8 sm:grid-cols-2" aria-label="Chapter navigation">
        {previous ? (
          <Link
            to={`/our-story/${previous.slug}`}
            className="group rounded-xl2 border border-line bg-surface p-5 transition-colors hover:border-rose-soft"
          >
            <span className="flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted">
              <ArrowLeft className="h-3 w-3" /> Previous
            </span>
            <span className="mt-2 block font-display text-xl text-ink group-hover:text-rose-deep">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/our-story/${next.slug}`}
            className="group rounded-xl2 border border-line bg-surface p-5 text-right transition-colors hover:border-rose-soft"
          >
            <span className="flex items-center justify-end gap-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted">
              Next <ArrowRight className="h-3 w-3" />
            </span>
            <span className="mt-2 block font-display text-xl text-ink group-hover:text-rose-deep">{next.title}</span>
          </Link>
        ) : (
          <Link
            to="/our-question"
            className="group rounded-xl2 border border-rose-soft/60 bg-surface p-5 text-right transition-colors hover:border-rose"
          >
            <span className="flex items-center justify-end gap-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted">
              One more page <ArrowRight className="h-3 w-3" />
            </span>
            <span className="mt-2 block font-display text-xl text-ink group-hover:text-rose-deep">I'd rather you find it</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
