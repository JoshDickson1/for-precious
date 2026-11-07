import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bookmark, CalendarDays, HeartPulse, NotebookPen, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/config/site";
import { longDate, zonedParts, greetingFor } from "@/lib/date";
import { listFavourites, listFeelings, listNotes, listPlans } from "@/lib/storage";
import { fetchNotes, notesConfigured } from "@/lib/backend";
import { cn } from "@/lib/utils";

interface Tool {
  to: string;
  icon: typeof NotebookPen;
  title: string;
  body: string;
  countKey: "notes" | "feelings" | "plans" | "favourites";
  unit: string;
  accent?: boolean;
  span?: string;
}

const tools: Tool[] = [
  {
    to: "/my-space/notes",
    icon: NotebookPen,
    title: "Notes",
    body: "The private notebook. Yours, behind the passphrase, safe if you clear your browser.",
    countKey: "notes",
    unit: "written",
    accent: true,
    span: "md:col-span-6 lg:col-span-4",
  },
  {
    to: "/my-space/feelings",
    icon: HeartPulse,
    title: "How I'm feeling",
    body: "A quick check-in. Keep it to yourself, or send it to me.",
    countKey: "feelings",
    unit: "check-ins",
    span: "md:col-span-3 lg:col-span-2",
  },
  {
    to: "/my-space/day-plan",
    icon: CalendarDays,
    title: "Plan my day",
    body: "Send me your day before it runs away with you.",
    countKey: "plans",
    unit: "plans",
    span: "md:col-span-3 lg:col-span-3",
  },
  {
    to: "/my-space/favourites",
    icon: Bookmark,
    title: "Favourite things",
    body: "Songs, places, ideas — a shelf that belongs to you.",
    countKey: "favourites",
    unit: "saved",
    span: "md:col-span-6 lg:col-span-3",
  },
];

const initialCounts = { notes: 0, feelings: 0, plans: 0, favourites: 0 };

export default function MySpace() {
  const [counts, setCounts] = useState(initialCounts);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [notes, feelings, plans, favourites] = await Promise.all([
          notesConfigured ? fetchNotes().catch(() => listNotes()) : listNotes(),
          listFeelings(),
          listPlans(),
          listFavourites(),
        ]);
        if (!cancelled) {
          setCounts({
            notes: notes.length,
            feelings: feelings.length,
            plans: plans.length,
            favourites: favourites.length,
          });
        }
      } catch {
        if (!cancelled) setStorageError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const parts = zonedParts(now, site.timezone);

  return (
    <div>
      <PageHeader
        eyebrow="My space"
        title={`${greetingFor(parts.hour)}, ${site.her.name}.`}
        intro="The practical half of all this. Write, check in, plan, collect — whatever today needs."
        aside={<p className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-muted">{longDate(now, site.timezone)}</p>}
      />

      <div className="mt-10 grid gap-4 md:grid-cols-6">
        {tools.map((tool, index) => (
          <Reveal key={tool.to} delay={index * 0.05} className={tool.span}>
            <Link
              to={tool.to}
              className={cn(
                "group flex h-full flex-col justify-between rounded-xl2 border p-6 transition-all duration-300 ease-silk hover:-translate-y-0.5 hover:shadow-soft",
                tool.accent
                  ? "border-rose-soft/60 bg-gradient-to-br from-blush/80 via-surface to-blush/30"
                  : "border-line bg-surface hover:border-rose-soft",
              )}
            >
              <div className="flex items-start justify-between">
                <tool.icon className={cn("h-5 w-5", tool.accent ? "text-rose-deep" : "text-rose")} strokeWidth={1.5} />
                <ArrowUpRight className="h-4 w-4 text-ink-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rose-deep" />
              </div>

              <div className="mt-10">
                <h2 className={cn("font-display text-ink", tool.accent ? "text-3xl" : "text-2xl")}>{tool.title}</h2>
                <p className="mt-2 max-w-sm text-[0.84rem] leading-relaxed text-ink-muted">{tool.body}</p>
                <p className="mt-5 text-[0.7rem] uppercase tracking-[0.18em] text-ink-muted/80">
                  {storageError ? "—" : counts[tool.countKey]} {tool.unit}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8">
        <div className="flex flex-col gap-4 rounded-xl2 border border-line bg-canvas px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
            <div>
              <p className="text-[0.84rem] font-medium text-ink">
                {storageError
                  ? "This browser won't let me save anything."
                  : "Notes are synced. Everything else lives on this device."}
              </p>
              <p className="mt-1 max-w-lg text-[0.78rem] leading-relaxed text-ink-muted">
                Notes are safe if you clear your browser. Check-ins, day plans and favourites are still local —
                back them up now and then so a new phone doesn't take them with it.
              </p>
            </div>
          </div>
          <Link
            to="/preferences"
            className="shrink-0 text-[0.78rem] font-medium text-rose-deep underline decoration-line underline-offset-4"
          >
            Back up / privacy
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
