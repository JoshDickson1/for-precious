import { useCallback, useState } from "react";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { GateHeartLottie } from "./GateHeartLottie";

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
  const [lottieReady, setLottieReady] = useState(false);
  const [lottieFailed, setLottieFailed] = useState(false);
  const handleLottieReady = useCallback(() => {
    setLottieReady(true);
    setLottieFailed(false);
  }, []);
  const handleLottieError = useCallback(() => setLottieFailed(true), []);

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
  // The animation is the flying element: it pops out of the input field on
  // submit and keeps playing as it travels to the centre.
  const showLottie = lottieReady && !lottieFailed;

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
                      scale: 1,
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
                  ? { duration: 1.4, ease: "easeInOut" }
                  : { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
            }
            className="absolute left-0 top-0 -ml-8 -mt-8 flex h-16 w-16 items-center justify-center text-on-accent"
          >
            <Heart
              className={`h-16 w-16 fill-current drop-shadow-[0_0_22px_rgba(255,46,154,0.9)] transition-opacity duration-200 ${
                lottieFailed ? "opacity-100" : "opacity-0"
              }`}
              strokeWidth={0.9}
            />
            <GateHeartLottie
              visible={showLottie}
              onReady={handleLottieReady}
              onError={handleLottieError}
              className="h-40 w-40 sm:h-52 sm:w-52"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
