import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL;

const DEFAULT_MASK =
  "radial-gradient(ellipse at 50% 55%, black 0%, black 35%, transparent 72%)";

/**
 * The real lily loop, treated as a floating bouquet: the black studio
 * background is dropped with `screen`, the edges are masked away, and a dark
 * veil keeps the copy readable. Lazy, muted, and still for reduced motion.
 *
 * Source: Mixkit #17803, "Several pink lily flowers opening"
 * (Mixkit Free License).
 */
export function FlowerVideo({
  className,
  opacity = 0.34,
  src = "lily-loop.mp4",
  poster = "lily-loop-poster.jpg",
  mask = DEFAULT_MASK,
  veil = true,
  veilClassName,
  blur = 0,
  objectPosition = "50% 45%",
}: {
  className?: string;
  opacity?: number;
  src?: string;
  poster?: string;
  mask?: string;
  veil?: boolean;
  veilClassName?: string;
  /** Softens the footage so it reads as a bouquet, not a video. */
  blur?: number;
  /** Keeps the lily heads in frame when the band is much wider than 16:9. */
  objectPosition?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inView || reduce) return;

    const play = () => {
      const attempt = video.play();
      if (attempt) attempt.catch(() => {});
    };

    if (video.readyState >= 2) {
      play();
      return;
    }

    video.addEventListener("canplay", play, { once: true });
    return () => video.removeEventListener("canplay", play);
  }, [inView, reduce]);

  const visualStyle = {
    opacity,
    mixBlendMode: "screen" as const,
    filter: `saturate(1.1) contrast(1.05) blur(${blur}px)`,
    WebkitMaskImage: mask,
    maskImage: mask,
  };

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {inView && !reduce ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ ...visualStyle, objectPosition }}
          src={`${BASE}${src}`}
          poster={`${BASE}${poster}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover"
          style={{
            ...visualStyle,
            backgroundPosition: objectPosition,
            backgroundImage: `url(${BASE}${poster})`,
          }}
        />
      )}

      {veil ? (
        <div
          className={cn("absolute inset-0", veilClassName)}
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(5,3,6,0.34) 55%, rgba(5,3,6,0.88) 100%)",
          }}
        />
      ) : null}
    </div>
  );
}
