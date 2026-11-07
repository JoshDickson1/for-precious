import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export type UnlockOrigin = { x: number; y: number };
export type UnlockPhase = "lift" | "beat" | "bloom" | "reveal";

export function UnlockBloom({
  origin,
  phase,
}: {
  origin?: UnlockOrigin;
  phase: UnlockPhase;
}) {
  const reduce = useReducedMotion() ?? false;
  const viewport =
    typeof window === "undefined"
      ? { innerWidth: 1440, innerHeight: 900 }
      : window;
  const centerX = viewport.innerWidth / 2;
  const centerY = viewport.innerHeight / 2;
  const startX = origin?.x ?? centerX;
  const startY = origin?.y ?? centerY;
  const dx = centerX - startX;
  const dy = centerY - startY;
  const circleSize = Math.ceil(Math.hypot(centerX, centerY) * 2.08);

  const bloom = phase === "bloom";
  const reveal = phase === "reveal";

  return (
    <div
      aria-hidden="true"
      data-unlock-bloom={phase}
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: reduce ? 0 : phase === "lift" || phase === "beat" ? 0.55 : 0,
        }}
        transition={{
          duration: phase === "beat" ? 0.35 : bloom ? 0.2 : 0.6,
          ease: "easeOut",
        }}
        className="absolute inset-0 bg-canvas"
      />

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.015 }}
        animate={
          bloom
            ? { opacity: 1, scale: 1 }
            : reveal
              ? { opacity: 0, scale: 1.06 }
              : { opacity: 0, scale: 0.015 }
        }
        transition={{
          duration: reduce ? 0.25 : bloom ? 1.05 : 1,
          ease: bloom ? [0.16, 1, 0.3, 1] : [0.4, 0, 0.2, 1],
        }}
        style={{
          left: centerX,
          top: centerY,
          width: circleSize,
          height: circleSize,
          marginLeft: -circleSize / 2,
          marginTop: -circleSize / 2,
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,247,251,0.22) 0%, rgba(255,138,210,0.2) 11%, rgba(255,46,154,0.12) 30%, rgba(24,8,17,0.58) 62%, rgba(5,3,6,0.88) 100%)",
        }}
        className="absolute rounded-full shadow-[0_0_160px_rgba(255,46,154,0.18)] backdrop-blur-2xl backdrop-saturate-150 will-change-transform"
      />

      {reduce ? null : (
        <div className="absolute" style={{ left: startX, top: startY }}>
          <motion.div
            data-unlock-heart
            initial={{ x: 0, y: 0, scale: 0.27, opacity: 1 }}
            animate={
              phase === "lift"
                ? {
                    x: [0, dx, dx],
                    y: [0, dy - 16, dy],
                    scale: [0.27, 1.04, 1],
                    opacity: 1,
                  }
                : phase === "beat"
                  ? {
                      x: dx,
                      y: dy,
                      scale: [1, 1.18, 1, 1.18, 1, 1.24],
                      opacity: 1,
                    }
                  : { x: dx, y: dy, scale: 2.3, opacity: 0 }
            }
            transition={
              phase === "lift"
                ? {
                    duration: 0.9,
                    times: [0, 0.72, 1],
                    ease: [0.45, 0, 0.55, 1],
                  }
                : phase === "beat"
                  ? {
                      duration: 1.4,
                      times: [0, 0.18, 0.36, 0.54, 0.72, 1],
                      ease: "easeInOut",
                    }
                  : { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
            }
            className="absolute left-0 top-0 -ml-8 -mt-8 flex h-16 w-16 items-center justify-center text-on-accent drop-shadow-[0_0_22px_rgba(255,46,154,0.9)]"
          >
            <Heart className="h-16 w-16 fill-current" strokeWidth={0.9} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
