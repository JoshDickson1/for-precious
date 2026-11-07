import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronLeft, Heart } from "lucide-react";
import type { UnlockOrigin } from "@/components/layout/UnlockBloom";
import { Input } from "@/components/ui/surface";
import { checkPassphrase, gateConfigured, unlock } from "@/lib/gate";

const STEP_LABELS = ["For you", "The word"];
const LINE_ONE_DELAY = 220;
const LINE_GAP = 130;
const LINE_SPEED = 44;
const BODY_SPEED = 18;

const FLOATING_HEARTS = [
  {
    key: "top-left",
    className: "left-[6%] top-[16%] h-8 w-8 text-rose/20 sm:h-10 sm:w-10",
    duration: 7,
    delay: 0,
    drift: -12,
    rotate: 5,
  },
  {
    key: "top-right",
    className: "right-[8%] top-[20%] h-5 w-5 text-rose-soft/25 sm:h-7 sm:w-7",
    duration: 8,
    delay: 0.8,
    drift: -9,
    rotate: -4,
  },
  {
    key: "mid-left",
    className: "left-[12%] top-[48%] h-4 w-4 text-rose/25 sm:h-5 sm:w-5",
    duration: 6,
    delay: 0.4,
    drift: -8,
    rotate: 6,
  },
  {
    key: "mid-right",
    className: "right-[14%] top-[54%] h-7 w-7 text-rose/15 sm:h-9 sm:w-9",
    duration: 9,
    delay: 1.2,
    drift: -14,
    rotate: -5,
  },
  {
    key: "bottom-right",
    className: "right-[9%] bottom-[18%] h-12 w-12 text-rose/10 sm:h-14 sm:w-14",
    duration: 8,
    delay: 0.6,
    drift: -10,
    rotate: 4,
  },
  {
    key: "bottom-left",
    className: "left-[18%] bottom-[14%] h-5 w-5 text-rose-soft/20 sm:h-6 sm:w-6",
    duration: 7,
    delay: 1.4,
    drift: -12,
    rotate: -3,
  },
];

function useTypewriter(
  text: string,
  enabled: boolean,
  startDelay: number,
  speed: number,
) {
  const reduce = useReducedMotion() ?? false;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }

    if (reduce) {
      setCount(text.length);
      return;
    }

    setCount(0);
    let index = 0;
    let interval: number | undefined;

    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        setCount(index);

        if (index >= text.length && interval) {
          window.clearInterval(interval);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [text, enabled, startDelay, speed, reduce]);

  return { visible: text.slice(0, count), typing: enabled && count < text.length };
}

function Typed({
  text,
  enabled,
  delay,
  speed,
  className,
}: {
  text: string;
  enabled: boolean;
  delay: number;
  speed: number;
  className?: string;
}) {
  const { visible, typing } = useTypewriter(text, enabled, delay, speed);

  return (
    <span className={className} aria-hidden="true">
      {visible}
      {typing ? (
        <span className="ml-0.5 inline-block h-[0.85em] w-px animate-pulse bg-rose align-middle" />
      ) : null}
    </span>
  );
}

export function Gate({
  onUnlock,
  revealed = true,
}: {
  onUnlock: (origin?: UnlockOrigin) => void;
  revealed?: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const submitRef = useRef<HTMLButtonElement>(null);
  const [stage, setStage] = useState<0 | 1>(0);
  const [introDone, setIntroDone] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [opening, setOpening] = useState(false);

  const showForm = stage === 1;
  const lineOne = showForm ? "A word only" : "A little world,";
  const lineTwo = showForm ? "you know." : "just for you.";
  const body = showForm
    ? "Say it quietly. The door opens only for you."
    : "Precious, everything in here is yours. One small step first.";
  const lineTwoDelay = LINE_ONE_DELAY + lineOne.length * LINE_SPEED + LINE_GAP;
  const bodyDelay = lineTwoDelay + lineTwo.length * LINE_SPEED + LINE_GAP;
  const bodyDuration = bodyDelay + body.length * BODY_SPEED;

  useEffect(() => {
    if (!revealed) {
      setIntroDone(false);
      return;
    }

    if (reduce) {
      setIntroDone(true);
      return;
    }

    setIntroDone(false);
    const timer = window.setTimeout(() => setIntroDone(true), bodyDuration + 120);
    return () => window.clearTimeout(timer);
  }, [revealed, reduce, bodyDuration]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim() || checking || opening) return;

    setChecking(true);
    setError("");

    try {
      const ok = await checkPassphrase(value);

      if (ok) {
        setOpening(true);
        unlock();
        const rect = submitRef.current?.getBoundingClientRect();
        onUnlock(
          rect
            ? {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              }
            : undefined,
        );
        return;
      }

      setError("That doesn't sound like our word.");
      setValue("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  }

  if (!gateConfigured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas px-6">
        <div className="max-w-xs text-center">
          <p className="font-display text-2xl text-ink">Not quite ready yet.</p>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            This little space is still being prepared. Come back soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {FLOATING_HEARTS.map((heart) => (
          <motion.span
            key={heart.key}
            animate={reduce ? undefined : { y: [0, heart.drift, 0], rotate: [0, heart.rotate, 0] }}
            transition={{
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
              ease: "easeInOut",
            }}
            className={`absolute ${heart.className}`}
          >
            <Heart className="h-full w-full fill-current" strokeWidth={1.2} />
          </motion.span>
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 px-5 pt-5 sm:px-8 sm:pt-6">
        <div className="grid w-full grid-cols-[2.25rem_1fr_2.25rem] items-center gap-3">
          <div>
            {showForm ? (
              <button
                type="button"
                onClick={() => {
                  setStage(0);
                  setIntroDone(false);
                  setValue("");
                  setError("");
                }}
                aria-label="Back to the first step"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-300 hover:bg-blush hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
              </button>
            ) : (
              <span aria-hidden="true" className="h-9 w-9" />
            )}
          </div>

          <div
            className="mx-auto flex w-full max-w-[180px] gap-1.5"
            role="progressbar"
            aria-label="Unlock progress"
            aria-valuemin={1}
            aria-valuemax={2}
            aria-valuenow={stage + 1}
            aria-valuetext={STEP_LABELS[stage]}
          >
            {STEP_LABELS.map((label, index) => (
              <span
                key={label}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  index <= stage ? "bg-rose-deep" : "bg-line"
                }`}
              />
            ))}
          </div>

          <span aria-hidden="true" className="h-9 w-9" />
        </div>
      </div>

      <section className="w-full max-w-[360px] text-center">
        <h1 className="text-left font-script text-[clamp(2.8rem,10vw,4.1rem)] leading-[1.15] text-ink">
          <span className="sr-only">
            {lineOne} {lineTwo}
          </span>
          <Typed
            key={`${stage}-one`}
            text={lineOne}
            enabled={revealed}
            delay={LINE_ONE_DELAY}
            speed={LINE_SPEED}
            className="block min-h-[1.05em] whitespace-nowrap"
          />
          <Typed
            key={`${stage}-two`}
            text={lineTwo}
            enabled={revealed}
            delay={lineTwoDelay}
            speed={LINE_SPEED}
            className="block min-h-[1.05em] whitespace-nowrap text-rose"
          />
        </h1>

        <p className="mt-4 min-h-[3.2rem] max-w-[300px] text-left text-[0.86rem] leading-relaxed text-ink-muted">
          <span className="sr-only">{body}</span>
          <Typed
            key={`${stage}-body`}
            text={body}
            enabled={revealed}
            delay={bodyDelay}
            speed={BODY_SPEED}
            className="block"
          />
        </p>

        <div className="relative mt-12 flex min-h-[9rem] flex-col items-center">
          <AnimatePresence mode="wait">
            {introDone && !showForm ? (
              <motion.button
                key="heart"
                type="button"
                onClick={() => {
                  setIntroDone(false);
                  setStage(1);
                }}
                initial={{ opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col items-center"
                aria-label="Click me to enter the passphrase"
              >
                <span
                  aria-hidden="true"
                  className="flex flex-col items-center gap-1"
                >
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      animate={{ opacity: [0.16, 1, 0.16], y: [0, 3, 0] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: dot * 0.18,
                        ease: "easeInOut",
                      }}
                      className="h-1 w-1 rounded-full bg-rose"
                    />
                  ))}
                  <ChevronDown
                    className="mt-0.5 h-4 w-4 text-rose-deep"
                    strokeWidth={1.8}
                  />
                </span>

                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mt-2 flex h-16 w-16 items-center justify-center rounded-full border border-rose/30 bg-blush/60 text-rose-deep shadow-[0_0_38px_-8px_rgba(255,46,154,0.7)] transition-colors duration-300 group-hover:border-rose-soft group-hover:bg-blush"
                >
                  <Heart className="h-6 w-6 fill-current" strokeWidth={1.6} />
                </motion.span>

                <span className="mt-3 text-[0.64rem] uppercase tracking-[0.28em] text-ink-muted transition-colors duration-300 group-hover:text-ink">
                  Click me
                </span>
              </motion.button>
            ) : introDone && showForm ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="w-full text-left"
              >
                <label htmlFor="gate" className="sr-only">
                  A word only you know
                </label>

                <div className="relative">
                  <Input
                    id="gate"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    value={value}
                    onChange={(event) => {
                      setValue(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter our little secret"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "gate-error" : undefined}
                    disabled={checking || opening}
                    className="h-[52px] rounded-full border-line bg-surface pl-5 pr-14 text-left text-sm tracking-[0.12em] text-ink shadow-soft placeholder:tracking-normal placeholder:text-ink-muted/50 focus-visible:border-rose focus-visible:ring-rose/20"
                  />

                  <button
                    ref={submitRef}
                    type="submit"
                    disabled={checking || opening || !value.trim()}
                    aria-label={checking ? "Opening…" : "Open your world"}
                    title={checking ? "Opening…" : "Open your world"}
                    className={`absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-rose-deep text-on-accent shadow-soft transition-all duration-300 hover:bg-[#E0007A] disabled:bg-blush disabled:text-ink-muted/50 disabled:shadow-none ${
                      opening ? "opacity-0" : ""
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 fill-current ${checking ? "animate-pulse" : ""}`}
                      strokeWidth={1.8}
                    />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.p
                      key="error"
                      id="gate-error"
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-3 text-center text-xs text-error"
                    >
                      {error}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.form>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
