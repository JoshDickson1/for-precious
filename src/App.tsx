import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Gate } from "@/components/layout/Gate";
import { Shell } from "@/components/layout/Shell";
import { SplashScreen } from "@/components/layout/SplashScreen";
import {
  UnlockBloom,
  type UnlockOrigin,
  type UnlockPhase,
} from "@/components/layout/UnlockBloom";
import { InfinitySpinner } from "@/components/ui/InfinitySpinner";
import { features } from "@/config/features";
import { isUnlocked } from "@/lib/gate";
import Home from "@/pages/Home";
import Story from "@/pages/Story";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";

const Memory = lazy(() => import("@/pages/Memory"));
const Question = lazy(() => import("@/pages/Question"));

// V2/V3 — kept as lazy chunks so v1 stays small.
const LittleThings = lazy(() => import("@/pages/LittleThings"));
const MySpace = lazy(() => import("@/pages/MySpace"));
const Notes = lazy(() => import("@/pages/Notes"));
const Feelings = lazy(() => import("@/pages/Feelings"));
const DayPlan = lazy(() => import("@/pages/DayPlan"));
const Favourites = lazy(() => import("@/pages/Favourites"));
const Preferences = lazy(() => import("@/pages/Preferences"));
const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));

function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <InfinitySpinner size={40} />
      <p className="eyebrow">Opening…</p>
    </div>
  );
}

const UNLOCK_TIMING = {
  lift: 900,
  beat: 1400,
  bloom: 1050,
  reveal: 1000,
} as const;

const UNLOCK_TIMING_REDUCED = {
  lift: 150,
  beat: 100,
  bloom: 320,
  reveal: 400,
} as const;

export default function App() {
  const reduce = useReducedMotion() ?? false;
  const [unlocked, setUnlocked] = useState(() => isUnlocked());
  const [showSplash, setShowSplash] = useState(true);
  const [splashGone, setSplashGone] = useState(false);
  const [unlockPhase, setUnlockPhase] = useState<"idle" | UnlockPhase>("idle");
  const [unlockOrigin, setUnlockOrigin] = useState<UnlockOrigin>();
  const bypassGate =
    features.unsubscribe &&
    window.location.pathname.replace(/\/$/, "") === "/unsubscribe";

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (unlockPhase === "idle") return;

    const current = unlockPhase;
    const timing = reduce ? UNLOCK_TIMING_REDUCED : UNLOCK_TIMING;
    const next: "idle" | UnlockPhase =
      current === "lift"
        ? "beat"
        : current === "beat"
          ? "bloom"
          : current === "bloom"
            ? "reveal"
            : "idle";

    const timer = window.setTimeout(() => {
      if (current === "bloom") setUnlocked(true);
      setUnlockPhase(next);
    }, timing[current]);

    return () => window.clearTimeout(timer);
  }, [unlockPhase, reduce]);

  function handleUnlock(origin?: UnlockOrigin) {
    if (unlockPhase !== "idle") return;
    setUnlockOrigin(origin);
    setUnlockPhase("lift");
  }

  const content =
    !unlocked && !bypassGate ? (
      <Gate onUnlock={handleUnlock} revealed={splashGone} />
    ) : (
      <motion.div
        initial={unlockPhase === "reveal" ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{
          duration: reduce ? 0.35 : 1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/our-question" element={<Question />} />
              <Route element={<Shell />}>
                <Route index element={<Home />} />
                <Route path="our-story" element={<Story />} />
                <Route path="our-story/:slug" element={<Memory />} />
                {features.littleThings ? (
                  <Route path="little-things" element={<LittleThings />} />
                ) : null}
                {features.mySpace ? (
                  <>
                    <Route path="my-space" element={<MySpace />} />
                    <Route path="my-space/notes" element={<Notes />} />
                    <Route path="my-space/feelings" element={<Feelings />} />
                    <Route path="my-space/day-plan" element={<DayPlan />} />
                    <Route path="my-space/favourites" element={<Favourites />} />
                  </>
                ) : null}
                {features.preferences ? (
                  <Route path="preferences" element={<Preferences />} />
                ) : null}
                <Route path="privacy" element={<Privacy />} />
                {features.unsubscribe ? (
                  <Route path="unsubscribe" element={<Unsubscribe />} />
                ) : null}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </motion.div>
    );

  return (
    <>
      <AnimatePresence onExitComplete={() => setSplashGone(true)}>
        {showSplash ? (
          <SplashScreen key="splash" onDismiss={() => setShowSplash(false)} />
        ) : null}
      </AnimatePresence>
      {content}
      {unlockPhase !== "idle" ? (
        <UnlockBloom origin={unlockOrigin} phase={unlockPhase} />
      ) : null}
    </>
  );
}
