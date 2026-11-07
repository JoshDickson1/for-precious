import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Copy, MessageCircle, X } from "lucide-react";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Lily, LilyMark } from "@/components/floral/Lily";
import { FadeIn } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/surface";
import {
  answerCopy,
  dateOptions,
  introStages,
  letter,
  question,
} from "@/content/reveal";
import { site } from "@/config/site";
import { submitAnswer } from "@/lib/backend";
import { getRevealResponse, setRevealResponse } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { RevealAnswer, RevealResponse } from "@/types";

type Step =
  | "intro"
  | "why"
  | "letter"
  | "question"
  | "answer"
  | "plan"
  | "done"
  | "responded";

const stepOrder: Step[] = ["intro", "why", "letter", "question"];

export default function Question() {
  const [step, setStep] = useState<Step>("intro");
  const [answer, setAnswer] = useState<RevealAnswer | null>(null);
  const [activity, setActivity] = useState<string>("arcade");
  const [customActivity, setCustomActivity] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [note, setNote] = useState("");
  const [existing, setExisting] = useState<RevealResponse | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getRevealResponse();
        if (saved) {
          setExisting(saved);
          setAnswer(saved.answer);
          setActivity(saved.activity ?? "arcade");
          setPreferredDate(saved.preferredDate ?? "");
          setNote(saved.note ?? "");
          setStep("responded");
        }
      } catch {
        /* storage unavailable: the experience still works, it just won't remember */
      }
    })();
  }, []);

  const index = stepOrder.indexOf(step);

  const summaryText = useMemo(() => {
    if (!answer) return "";
    const chosen = dateOptions.find((option) => option.id === activity);
    const activityLabel =
      activity === "custom"
        ? customActivity.trim() || "Something she picks"
        : (chosen?.label ?? "Something");
    if (answer !== "yes") {
      return answer === "think"
        ? "I read all of it. I need a little time."
        : "I read all of it. I'm saying no.";
    }
    return [
      "She said yes.",
      `Activity: ${activityLabel}`,
      preferredDate ? `Date: ${preferredDate}` : "Date: still deciding",
      note.trim() ? `Note: ${note.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [answer, activity, customActivity, preferredDate, note]);

  async function choose(next: RevealAnswer) {
    setAnswer(next);
    const response: RevealResponse = {
      answer: next,
      createdAt: new Date().toISOString(),
    };
    try {
      await setRevealResponse(response);
    } catch {
      /* ignore */
    }
    if (next === "yes") {
      setStep("plan");
    } else {
      setStep("answer");
    }
  }

  async function lockIn() {
    if (!answer) return;
    const response: RevealResponse = {
      answer,
      activity,
      customActivity: activity === "custom" ? customActivity.trim() : undefined,
      preferredDate: preferredDate || undefined,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    try {
      await setRevealResponse(response);
    } catch {
      /* ignore */
    }
    setStep("done");
  }

  async function sendToPapi() {
    if (!answer) return;
    setSending(true);
    setSendError("");
    try {
      await submitAnswer({
        answer,
        activity,
        customActivity,
        preferredDate,
        note,
      });
      setSent(true);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "That didn't send.",
      );
    } finally {
      setSending(false);
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setSendError("Couldn't copy. Select the text yourself.");
    }
  }

  if (step === "responded" && existing) {
    return (
      <RevealFrame onClose="/">
        <div className="mx-auto max-w-lg text-center">
          <Lily size={120} className="mx-auto" />
          <p className="eyebrow mt-4">You already answered</p>
          <h1 className="mt-3 font-display text-display-md text-ink">
            {existing.answer === "yes"
              ? "You said yes."
              : "You said your piece."}
          </h1>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-muted">
            {existing.answer === "yes"
              ? "It's still on. Nothing here expires."
              : "And that's allowed. This place stays yours either way."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => setStep("intro")}>
              Read it again
            </Button>
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center rounded-full px-6 text-[0.86rem] text-ink-muted hover:bg-blush"
            >
              Back home
            </Link>
          </div>
        </div>
      </RevealFrame>
    );
  }

  return (
    <RevealFrame onClose="/">
      {index >= 0 ? (
        <div className="mb-10 flex items-center gap-2" aria-hidden="true">
          {stepOrder.map((item, itemIndex) => (
            <span
              key={item}
              className={cn(
                "h-px flex-1 transition-colors duration-500",
                itemIndex <= index ? "bg-rose" : "bg-line",
              )}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === "intro" ? (
            <div className="mx-auto max-w-xl text-center">
              <p className="eyebrow">{introStages[0].eyebrow}</p>
              <h1 className="mt-5 font-display text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.98] text-balance text-ink">
                {introStages[0].title}
              </h1>
              <div className="mx-auto mt-6 max-w-md space-y-3">
                {introStages[0].paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-pretty text-[0.96rem] leading-relaxed text-ink-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <Button size="lg" className="mt-8" onClick={() => setStep("why")}>
                I'm ready
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {step === "why" ? (
            <div className="mx-auto max-w-xl">
              <p className="eyebrow">{introStages[1].eyebrow}</p>
              <h1 className="mt-5 font-display text-display-lg text-balance text-ink">
                {introStages[1].title}
              </h1>
              <div className="mt-6 space-y-4">
                {introStages[1].paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-pretty text-[1rem] leading-relaxed text-ink-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3">
                <Button onClick={() => setStep("letter")}>
                  Read the letter
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("intro")}
                  className="text-[0.8rem] text-ink-muted hover:text-ink"
                >
                  Back
                </button>
              </div>
            </div>
          ) : null}

          {step === "letter" ? (
            <div className="mx-auto max-w-xl">
              <FadeIn>
                <Card className="paper relative overflow-hidden px-6 py-9 sm:px-11 sm:py-12">
                  <div className="pointer-events-none absolute -right-8 -top-8 opacity-[0.06]">
                    <LilyMark className="h-40 w-40 text-rose-deep" />
                  </div>
                  <p className="font-display text-2xl text-ink">
                    {letter.greeting}
                  </p>
                  <div className="mt-5 space-y-4">
                    {letter.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className="text-pretty font-display text-[1.15rem] leading-[1.65] text-ink/90 sm:text-[1.22rem]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="mt-8">
                    <p className="font-display text-lg italic text-ink-muted">
                      {letter.signoff}
                    </p>
                    <p className="mt-1 font-display text-2xl italic text-rose-deep">
                      {letter.signature}
                    </p>
                  </div>
                </Card>
              </FadeIn>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => setStep("question")}>
                  There's one more thing
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("why")}
                  className="text-[0.8rem] text-ink-muted hover:text-ink"
                >
                  Read that again
                </button>
              </div>
            </div>
          ) : null}

          {step === "question" ? (
            <div className="mx-auto max-w-xl text-center">
              <Lily size={110} className="mx-auto" />
              <p className="eyebrow mt-4">{question.eyebrow}</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,8vw,4.2rem)] leading-[1] text-balance text-ink">
                {question.title}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-pretty text-[0.95rem] leading-relaxed text-ink-muted">
                {question.subtitle}
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => choose("yes")}>
                  Yes, obviously
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => choose("think")}
                >
                  Give me a minute
                </Button>
              </div>

              <button
                type="button"
                onClick={() => choose("no")}
                className="mt-5 text-[0.76rem] text-ink-muted underline decoration-line underline-offset-4 hover:text-ink"
              >
                I need to say no
              </button>
              <p className="mt-6 text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted/70">
                Any answer is allowed here.
              </p>
            </div>
          ) : null}

          {step === "answer" && answer ? (
            <div className="mx-auto max-w-lg text-center">
              <Lily size={100} className="mx-auto" />
              <h1 className="mt-5 font-display text-display-md text-balance text-ink">
                {answerCopy[answer].title}
              </h1>
              <p className="mt-4 text-pretty text-[0.96rem] leading-relaxed text-ink-muted">
                {answerCopy[answer].body}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => setStep("question")}>
                  Change my answer
                </Button>
                <Link
                  to="/"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-[0.86rem] text-ink"
                >
                  Back home
                </Link>
              </div>
            </div>
          ) : null}

          {step === "plan" ? (
            <div className="mx-auto max-w-xl">
              <p className="eyebrow">Right answer</p>
              <h1 className="mt-3 font-display text-display-lg text-ink">
                Now let's make it real.
              </h1>
              <p className="mt-3 max-w-md text-[0.94rem] leading-relaxed text-ink-muted">
                Pick something. If none of it fits, pick "let me pick" and be
                specific.
              </p>

              <div className="mt-7 grid gap-2">
                {dateOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActivity(option.id)}
                    aria-pressed={activity === option.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      activity === option.id
                        ? "border-rose-deep bg-blush/50"
                        : "border-line bg-surface hover:border-rose-soft",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        activity === option.id
                          ? "border-rose-deep bg-rose-deep"
                          : "border-line",
                      )}
                    >
                      {activity === option.id ? (
                        <Check className="h-2.5 w-2.5 text-on-accent" />
                      ) : null}
                    </span>
                    <span>
                      <span className="block text-[0.92rem] font-medium text-ink">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[0.8rem] leading-relaxed text-ink-muted">
                        {option.detail}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {activity === "custom" ? (
                <div className="mt-4">
                  <Label htmlFor="custom">Your idea</Label>
                  <Input
                    id="custom"
                    value={customActivity}
                    onChange={(event) => setCustomActivity(event.target.value)}
                    placeholder="Tell me exactly what you want"
                  />
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="preferred-date">A day that works</Label>
                  <input
                    id="preferred-date"
                    type="date"
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <Label htmlFor="note">Anything else</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={lockIn}
                  disabled={activity === "custom" && !customActivity.trim()}
                >
                  Lock it in
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("question")}
                  className="text-[0.8rem] text-ink-muted hover:text-ink"
                >
                  Back
                </button>
              </div>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="mx-auto max-w-lg text-center">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Lily size={130} className="mx-auto" />
              </motion.div>
              <p className="eyebrow mt-4">It's official</p>
              <h1 className="mt-3 font-display text-display-lg text-balance text-ink">
                So that's us, then.
              </h1>

              <div className="mt-5 rounded-xl2 border border-line bg-surface p-5 text-left">
                <pre className="whitespace-pre-wrap font-sans text-[0.86rem] leading-relaxed text-ink">
                  {summaryText || "She said yes."}
                </pre>
              </div>

              {sent ? (
                <p className="mt-4 flex items-center justify-center gap-2 text-[0.84rem] text-success">
                  <Check className="h-4 w-4" /> Sent to Papi. He's insufferable
                  about it already.
                </p>
              ) : (
                <>
                  <p className="mt-4 text-[0.84rem] leading-relaxed text-ink-muted">
                    One thing left — send this to Papi so he has it.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button onClick={sendToPapi} disabled={sending}>
                      <MessageCircle className="h-4 w-4" />
                      {sending ? "Sending…" : "Send it to Papi"}
                    </Button>
                    <Button variant="secondary" onClick={copySummary}>
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy it"}
                    </Button>
                  </div>
                  {sendError ? (
                    <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-muted">
                      Sending isn't connected right now. Copy it and send it to
                      him directly — he'll be waiting.
                    </p>
                  ) : null}
                </>
              )}

              <div className="mt-8">
                <Link
                  to="/"
                  className="text-[0.8rem] text-ink-muted underline decoration-line underline-offset-4 hover:text-ink"
                >
                  Back to the little world
                </Link>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </RevealFrame>
  );
}

function RevealFrame({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: string;
}) {
  return (
    <>
      <AuroraBackground />
      <div className="paper relative z-10 min-h-dvh overflow-hidden bg-transparent">
        <div className="pointer-events-none absolute -bottom-24 -right-24 opacity-20">
          <Lily size={520} animated />
        </div>

        <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2.5"
              aria-label="For Precious, home"
            >
              <LilyMark className="h-5 w-5 text-rose" />
              <span className="font-display text-[1.2rem] text-ink">
                For Precious
              </span>
            </Link>
            <Link
              to={onClose}
              aria-label="Leave this page"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-blush hover:text-ink"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-1 flex-col justify-center py-12">
            {children}
          </div>

          <p className="text-center text-[0.66rem] uppercase tracking-[0.2em] text-ink-muted/60">
            {site.domain}
          </p>
        </div>
      </div>
    </>
  );
}
