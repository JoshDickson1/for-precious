import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Lily } from "@/components/floral/Lily";
import { MemoryPlate } from "@/components/cards/MemoryCard";
import { buttonVariants } from "@/components/ui/button";
import { publishedMemories } from "@/content/memories";
import { cn } from "@/lib/utils";

type TunnelItem = {
  key: string;
  title: string;
  eyebrow: string;
  hidden?: boolean;
};

const ITEMS: TunnelItem[] = [
  ...publishedMemories.map((memory) => ({
    key: memory.slug,
    title: memory.title,
    eyebrow: memory.eyebrow,
  })),
  {
    key: "the-last-page",
    title: "One page left",
    eyebrow: "Not written here",
    hidden: true,
  },
];

type TunnelGeometry = {
  item: TunnelItem;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
};

const GEOMETRY: TunnelGeometry[] = ITEMS.map((item, i) => {
  const goldenAngle = i * 137.5 * (Math.PI / 180);

  return {
    item,
    angleCos: Math.cos(goldenAngle),
    angleSin: Math.sin(goldenAngle),
    radiusFactorX: 0.3 + (i % 3) * 0.075,
    radiusFactorY: 0.28 + (i % 2) * 0.085,
    rotationZ: (i % 2 === 0 ? 1 : -1) * (2.5 + (i % 4) * 1.8),
    index: i,
  };
});

const SPRING_CONFIG = { stiffness: 70, damping: 26, mass: 0.5 };

type StageDimensions = {
  width: number;
  height: number;
  isMobile: boolean;
};

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

function TunnelCard({
  card,
  progress,
  pointer,
  total,
  stage,
}: {
  card: TunnelGeometry;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: StageDimensions;
}) {
  const staggerSpan = 0.62;
  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;

  const localProgress = useTransform(progress, [start, end], [0, 1]);

  const farZ = stage.isMobile ? -1100 : -1500;
  const nearZ = stage.isMobile ? 300 : 480;
  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

  const opacity = useTransform(localProgress, [0, 0.16, 0.84, 0.98], [0, 1, 1, 0]);

  const cardWidth = stage.isMobile
    ? Math.max(110, Math.min(160, stage.width * 0.34))
    : Math.max(150, Math.min(210, stage.width * 0.19));

  const baseX = card.angleCos * (stage.width * card.radiusFactorX);
  const baseY = card.angleSin * (stage.height * card.radiusFactorY);
  const panStrength = stage.isMobile ? 16 : 34;

  const transform = useTransform(
    [z, pointer.x, pointer.y],
    ([currZ, px, py]: number[]) => {
      const offsetX = baseX - px * panStrength;
      const offsetY = baseY - py * panStrength;
      return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
    },
  );

  return (
    <motion.div
      aria-hidden="true"
      style={{ width: cardWidth, transform, opacity, zIndex: card.index + 1 }}
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-[4/5] select-none will-change-transform"
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[18px] border bg-gradient-to-br shadow-lift",
          card.item.hidden
            ? "border-gold/30 from-[#2A1A08] via-[#1A1008] to-[#0D0805]"
            : "border-line/80 from-blush via-[#170A11] to-[#0B0509]",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Lily
            size={190}
            tone={card.item.hidden ? "cream" : "blush"}
            className="opacity-80"
          />
        </div>

        <span className="absolute right-3 top-2 font-display text-[0.9rem] italic text-rose-deep/70">
          {card.item.hidden ? "?" : String(card.index + 1).padStart(2, "0")}
        </span>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas/95 via-canvas/60 to-transparent p-3">
          <p className="text-[0.52rem] uppercase tracking-[0.22em] text-ink-muted">
            {card.item.eyebrow}
          </p>
          <p className="mt-1 font-display text-[0.92rem] leading-tight text-ink">
            {card.item.title}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function PerspectiveCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;

  const [stage, setStage] = useState<StageDimensions>({
    width: 960,
    height: 620,
    isMobile: false,
  });

  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 100,
    damping: 26,
    restDelta: 0.0001,
  });

  const pointer = useCameraParallax(!reduce);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setStage({
        width: rect.width,
        height: rect.height,
        isMobile: rect.width < 720,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduce) return;

    let inView = false;
    let touchY = 0;

    const visibility = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.45 },
    );
    visibility.observe(el);

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const step = (delta: number) => {
      const current = rawProgress.get();
      const next = clamp(current + delta);
      if (next === current) return false;
      rawProgress.set(next);
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (!inView || event.ctrlKey || event.metaKey) return;
      if (step(event.deltaY * 0.0019)) event.preventDefault();
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchY;
      const delta = touchY - y;
      touchY = y;
      if (step(delta * 0.005)) event.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      visibility.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [rawProgress, reduce]);

  const nudge = (direction: number) => {
    const next = Math.min(1, Math.max(0, rawProgress.get() + direction));
    rawProgress.set(next);
  };

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-label="Read our story and find the last page"
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          nudge(0.16);
        }
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          nudge(-0.16);
        }
      }}
      className={cn(
        "relative mt-20 ml-[calc(50%-50vw)] flex w-screen select-none flex-col items-center justify-center overflow-hidden border-y border-line bg-gradient-to-b from-[#160A11]/85 via-[#0E070B]/75 to-[#0A0508]/90 backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-rose-deep/40",
        reduce ? "min-h-0 px-6 py-16" : "h-[min(68svh,600px)] min-h-[460px]",
      )}
      style={{
        perspective: stage.isMobile ? "900px" : "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,46,154,0.22)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,46,154,0.24)_0%,transparent_68%)]" />
      <div className="pointer-events-none absolute h-[46vmin] w-[46vmin] rounded-full border border-rose/15" />
      <div className="pointer-events-none absolute h-[72vmin] w-[72vmin] rounded-full border border-dashed border-line" />

      {reduce ? null : (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {GEOMETRY.map((card) => (
            <TunnelCard
              key={card.item.key}
              card={card}
              progress={smoothProgress}
              pointer={pointer}
              total={GEOMETRY.length}
              stage={stage}
            />
          ))}
        </div>
      )}

      <div className="relative z-20 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <p className="eyebrow">Before you close this</p>

        <h2 className="mt-4 text-balance font-display text-[clamp(2.4rem,6vw,4.25rem)] leading-[0.95] tracking-[-0.02em] text-ink">
          There&rsquo;s more to
          <br />
          <span className="italic text-rose-deep">walk through.</span>
        </h2>

        <p className="mt-5 max-w-[38ch] text-pretty text-[0.92rem] leading-relaxed text-ink-muted">
          Five chapters, the way it actually happened — and one last page I left
          for you to find on your own.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/our-story" className={buttonVariants({ size: "lg" })}>
            Start the story
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/our-question"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            I think I found it
          </Link>
        </div>

        {reduce ? (
          <div className="mt-12 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {publishedMemories.map((memory) => (
              <Link
                key={memory.slug}
                to={`/our-story/${memory.slug}`}
                className="group block text-left"
              >
                <MemoryPlate memory={memory} className="aspect-[5/4]" />
                <p className="mt-2 truncate font-display text-[0.95rem] text-ink transition-colors group-hover:text-rose-deep">
                  {memory.title}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-[0.68rem] uppercase tracking-[0.24em] text-ink-muted/80">
            Scroll, drag or use the arrow keys
          </p>
        )}
      </div>

      {reduce ? null : (
        <div className="pointer-events-none absolute inset-x-8 bottom-6 z-20 h-px overflow-hidden rounded-full bg-line">
          <motion.div
            style={{ scaleX: smoothProgress }}
            className="h-full origin-left bg-rose-deep"
          />
        </div>
      )}
    </section>
  );
}

export default PerspectiveCta;
