import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

/**
 * The real gate animation, exported from LottieFiles as a dotLottie and
 * unzipped into `public/gate-heart.json` (500x500, 3s, 60fps).
 *
 * It mounts the moment the gate is submitted and plays immediately, so the
 * SVG itself is what pops out of the input field and flies to the centre.
 * `preloadGateHeart()` warms the player + JSON while the passphrase is being
 * typed, so playback starts with no heart-icon flash.
 */
const ANIMATION_SRC = `${import.meta.env.BASE_URL}gate-heart.json`;

export function GateHeartLottie({
  visible,
  onReady,
  onError,
  className,
}: {
  visible: boolean;
  onReady?: () => void;
  onError?: () => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);

  readyRef.current = onReady;
  errorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let loaded = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled && !loaded) errorRef.current?.();
    }, 2000);

    import("lottie-web/build/player/lottie_svg")
      .then(({ default: lottie }) => {
        if (cancelled) return;

        const animation = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: true,
          autoplay: false,
          path: ANIMATION_SRC,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
          },
        });

        animationRef.current = animation;

        animation.addEventListener("DOMLoaded", () => {
          if (cancelled) return;
          loaded = true;
          window.clearTimeout(timeout);
          animation.goToAndPlay(animation.firstFrame, true);
          readyRef.current?.();
        });
      })
      .catch(() => {
        if (!cancelled) {
          window.clearTimeout(timeout);
          errorRef.current?.();
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      } ${className ?? ""}`}
    />
  );
}
