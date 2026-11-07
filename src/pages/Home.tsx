import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  HeartPulse,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { EmailSignup } from "@/components/EmailSignup";
import { MusicPlayer } from "@/components/MusicPlayer";
import { PerspectiveCta } from "@/components/PerspectiveCta";
import { MemoryCard } from "@/components/cards/MemoryCard";
import { Lily, LilyDivider } from "@/components/floral/Lily";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { Card, Chip } from "@/components/ui/surface";
import { publishedMemories } from "@/content/memories";
import { dailyItemFor } from "@/content/daily";
import { features } from "@/config/features";
import { site } from "@/config/site";
import { dayKey, greetingFor, longDate, zonedParts } from "@/lib/date";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  note: "A note from Papi",
  affirmation: "For today",
  prompt: "Something to think about",
  discovery: "A small discovery",
};

// V2 — My Space cards. Hidden while features.mySpace is off.
const quickActions = [
  {
    to: "/my-space/notes",
    icon: NotebookPen,
    title: "Write it down",
    body: "Thoughts, ideas, the things you don't want to forget.",
  },
  {
    to: "/my-space/feelings",
    icon: HeartPulse,
    title: "How I'm feeling",
    body: "Check in. Keep it private, or send it to me.",
  },
  {
    to: "/my-space/day-plan",
    icon: CalendarDays,
    title: "Plan my day",
    body: "Send me your day before it runs away with you.",
  },
  {
    to: "/my-space/favourites",
    icon: Bookmark,
    title: "Favourite things",
    body: "Songs, places, ideas. A shelf that's just yours.",
  },
] as const;

export default function Home() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const { greeting, today, item } = useMemo(() => {
    const parts = zonedParts(now, site.timezone);
    const day = dayKey(now, site.timezone);
    return {
      greeting: greetingFor(parts.hour),
      today: longDate(now, site.timezone),
      item: dailyItemFor(day),
    };
  }, [now]);

  return (
    <div>
      <section className="relative overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <FadeIn delay={0.05}>
              <div className="flex flex-wrap items-center gap-3">
                <Chip className="border-rose-soft/60 bg-surface/80">
                  {today}
                </Chip>
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-muted">
                  {site.timezone.split("/")[1]?.replace("_", " ")}
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h1 className="mt-7 font-display text-display-xl text-balance text-ink">
                {greeting},
                <br />
                <span className="italic text-rose-deep">{site.her.name}.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.25}>
              <p className="mt-7 max-w-md text-pretty text-[1rem] leading-relaxed text-ink-muted">
                There's a little world here I made just for you — our story so
                far, a small note for today, and one page I hope you find on
                your own. Look around. I'll wait.
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/our-story"
                  className={buttonVariants({ size: "lg" })}
                >
                  Start with our story
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#today"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                  })}
                >
                  Today's little thing
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.45}>
              <p className="mt-8 text-[0.74rem] uppercase tracking-[0.18em] text-ink-muted/80">
                {publishedMemories.length} chapters so far · one page you
                haven't found yet
              </p>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.25}
            className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px]"
          >
            <div className="relative overflow-hidden rounded-t-[999px] rounded-b-xl2 border border-rose/20 bg-gradient-to-b from-[#2A0A1C]/90 via-[#180912]/90 to-[#0B0509]/85 px-6 pb-14 pt-10 shadow-[0_0_90px_-20px_rgba(255,46,154,0.55)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_30%_20%,rgba(255,46,154,0.32)_0%,transparent_52%)]" />
              <p className="relative text-center font-sans text-[0.6rem] uppercase tracking-[0.28em] text-ink-muted">
                since the ninth of October
              </p>
              <Lily size={280} className="relative mx-auto mt-6" />
            </div>

            <div className="absolute -bottom-7 -left-4 w-[190px] rotate-[-3deg] rounded-xl2 border border-line bg-surface/95 p-4 shadow-soft backdrop-blur sm:-left-8">
              <p className="font-display text-2xl leading-none text-ink">
                Babe.
              </p>
              <p className="mt-1 font-display text-2xl italic leading-none text-rose-deep">
                Baber.
              </p>
              <p className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
                our entire language
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Reveal>
        <section id="today" className="scroll-mt-24">
          <Card className="paper overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[1.35fr_0.65fr]">
              <div className="p-6 sm:p-9">
                <div className="flex items-center justify-between gap-4">
                  <p className="eyebrow">{typeLabels[item.type]}</p>
                  <Sparkles className="h-3.5 w-3.5 text-rose" />
                </div>

                <p
                  className={cn(
                    "mt-4 text-pretty font-display text-[clamp(1.6rem,3.6vw,2.15rem)] leading-[1.25] text-ink",
                    item.type === "affirmation" && "italic",
                  )}
                >
                  {item.body}
                </p>

                {item.type === "note" ? (
                  <p className="mt-5 font-display text-lg italic text-rose-deep">
                    — Papi
                  </p>
                ) : null}

                {features.littleThings ||
                (features.mySpace && item.type === "prompt") ? (
                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.78rem]">
                    {features.littleThings ? (
                      <Link
                        to="/little-things"
                        className="link-underline font-medium text-rose-deep"
                      >
                        More little things
                      </Link>
                    ) : null}
                    {features.mySpace && item.type === "prompt" ? (
                      <Link
                        to="/my-space/notes"
                        className="link-underline text-ink-muted hover:text-ink"
                      >
                        Answer it in your notes
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="relative hidden border-l border-line bg-blush/20 p-8 md:block">
                <p className="eyebrow">Today</p>
                <p className="mt-2 font-display text-2xl text-ink">{today}</p>
                <p className="mt-1 text-[0.8rem] text-ink-muted">
                  A fresh one every morning.
                </p>
                <div className="mt-8">
                  <Lily size={120} />
                </div>
              </div>
            </div>
          </Card>
        </section>
      </Reveal>

      {features.mySpace ? (
        <Reveal className="mt-12">
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Stay a while</p>
                <h2 className="font-display text-display-md text-ink">
                  Your corner
                </h2>
              </div>
              <Link
                to="/my-space"
                className="hidden text-[0.8rem] text-ink-muted hover:text-rose-deep sm:block"
              >
                All of it <ArrowUpRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group rounded-xl2 border border-line bg-surface p-5 transition-all duration-300 ease-silk hover:-translate-y-0.5 hover:border-rose-soft hover:shadow-soft"
                >
                  <action.icon
                    className="h-5 w-5 text-rose"
                    strokeWidth={1.5}
                  />
                  <h3 className="mt-6 font-display text-xl text-ink">
                    {action.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-muted">
                    {action.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.72rem] font-medium text-rose-deep opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}

      <section className="mt-20">
        <Reveal>
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Our story</p>
              <h2 className="font-display text-display-md text-ink">
                How we got here
              </h2>
            </div>
            <Link
              to="/our-story"
              className="hidden text-[0.8rem] text-ink-muted transition-colors hover:text-rose-deep sm:block"
            >
              All {publishedMemories.length} chapters{" "}
              <ArrowUpRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {publishedMemories.slice(0, 3).map((memory, index) => (
            <Reveal key={memory.slug} delay={index * 0.07}>
              <MemoryCard memory={memory} compact />
            </Reveal>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link
            to="/our-story"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            Read all {publishedMemories.length} chapters
          </Link>
        </div>
      </section>

      <Reveal className="mt-20">
        <MusicPlayer />
      </Reveal>

      <Reveal className="mt-20">
        <Countdown />
      </Reveal>

      {features.email ? (
        <Reveal className="mt-20">
          <section className="rounded-xl2 border border-line bg-surface p-6 sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="eyebrow mb-3">In your inbox</p>
                <h2 className="font-display text-display-md text-balance text-ink">
                  A small note, most mornings.
                </h2>
                <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-ink-muted">
                  One short message. A link back to this little world. Nothing
                  else, I promise.
                </p>
              </div>
              <div className="lg:pl-6">
                <EmailSignup />
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <PerspectiveCta />
      </Reveal>

      <Reveal className="mt-20">
        <div className="text-center">
          <LilyDivider />
          <p className="mx-auto mt-6 max-w-md font-display text-2xl italic leading-snug text-ink sm:text-[1.7rem]">
            “You're my favourite notification, {site.her.name}.”
          </p>
          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.2em] text-ink-muted">
            — Papi
          </p>
        </div>
      </Reveal>
    </div>
  );
}
