import { useEffect, useState } from "react";
import { Check, Copy, HeartPulse, Lock, MessageCircle, Send, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card, Label, Textarea } from "@/components/ui/surface";
import { backendConfigured, whatsappShareUrl, submitFeelings } from "@/lib/backend";
import { deleteFeeling, listFeelings, saveFeeling } from "@/lib/storage";
import { relativeDay } from "@/lib/date";
import { cn, newId, titleCase } from "@/lib/utils";
import type { Feeling, FeelingsEntry } from "@/types";

const feelings: Feeling[] = [
  "happy",
  "excited",
  "calm",
  "loved",
  "grateful",
  "tired",
  "anxious",
  "sad",
  "frustrated",
  "overwhelmed",
  "unsure",
];

type Mode = "idle" | "review" | "local-saved" | "shared" | "fallback";

export default function Feelings() {
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [reflection, setReflection] = useState("");
  const [tags, setTags] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<FeelingsEntry[]>([]);
  const [copied, setCopied] = useState(false);

  async function refresh() {
    try {
      setHistory(await listFeelings());
    } catch {
      setError("This browser isn't letting me read your saved check-ins.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const tagList = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);

  function reset() {
    setFeeling(null);
    setIntensity(3);
    setReflection("");
    setTags("");
    setMode("idle");
    setError("");
  }

  async function savePrivate() {
    if (!feeling) return;
    setBusy(true);
    setError("");
    try {
      await saveFeeling({
        feeling,
        intensity,
        reflection: reflection.trim(),
        tags: tagList,
        shared: false,
      });
      await refresh();
      setMode("local-saved");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmShare() {
    if (!feeling) return;
    setBusy(true);
    setError("");
    const entry: FeelingsEntry = {
      id: newId(),
      feeling,
      intensity,
      reflection: reflection.trim(),
      tags: tagList,
      createdAt: new Date().toISOString(),
      shared: true,
    };
    try {
      await submitFeelings(entry);
      await saveFeeling({ ...entry });
      await refresh();
      setMode("shared");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That didn't send.");
      setMode("fallback");
    } finally {
      setBusy(false);
    }
  }

  const shareText = feeling
    ? [
        `How I'm feeling — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`,
        `Feeling: ${titleCase(feeling)} (${intensity}/5)`,
        reflection.trim() ? `What's on my mind: ${reflection.trim()}` : "",
        tagList.length ? `Tags: ${tagList.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Couldn't copy. Select the text and copy it manually.");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="My space · Check-in"
        title="How are you, actually?"
        intro="Not the version you give when someone asks in passing. The real one. Keep it here, or send it to me — your call, always."
        aside={<HeartPulse className="h-6 w-6 text-rose" strokeWidth={1.4} />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5 sm:p-7">
          {mode === "local-saved" || mode === "shared" ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blush">
                <Check className="h-5 w-5 text-rose-deep" />
              </div>
              <h2 className="mt-5 font-display text-2xl text-ink">
                {mode === "shared" ? "Sent to Papi." : "Saved. Just for you."}
              </h2>
              <p className="mt-2 max-w-xs text-[0.86rem] leading-relaxed text-ink-muted">
                {mode === "shared"
                  ? "He's got it. He'll probably reply with something ridiculous, then something soft."
                  : "It's on this device and nowhere else. Nothing was sent to anyone."}
              </p>
              <Button variant="secondary" className="mt-6" onClick={reset}>
                Check in again
              </Button>
            </div>
          ) : mode === "review" || mode === "fallback" ? (
            <div>
              <p className="eyebrow">{mode === "review" ? "Before it goes" : "Sending isn't connected"}</p>
              <h2 className="mt-2 font-display text-2xl text-ink">
                {mode === "review" ? "This is exactly what Papi will see." : "Send it to him yourself."}
              </h2>

              <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-line bg-canvas p-4 font-sans text-[0.84rem] leading-relaxed text-ink">
                {shareText}
              </pre>

              {mode === "review" ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={confirmShare} disabled={busy}>
                    <Send className="h-4 w-4" />
                    {busy ? "Sending…" : "Yes, send it"}
                  </Button>
                  <Button variant="ghost" onClick={() => setMode("idle")} disabled={busy}>
                    Not yet
                  </Button>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={copyShare}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy it"}
                  </Button>
                  <a
                    href={whatsappShareUrl(shareText)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-rose-deep px-6 text-[0.86rem] font-medium text-on-accent"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open WhatsApp
                  </a>
                  <Button variant="ghost" onClick={() => setMode("idle")}>
                    Back
                  </Button>
                </div>
              )}

              {error ? <p className="mt-3 text-[0.78rem] text-error">{error}</p> : null}
            </div>
          ) : (
            <>
              <div>
                <Label>Right now I feel</Label>
                <div className="flex flex-wrap gap-2">
                  {feelings.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFeeling(option)}
                      aria-pressed={feeling === option}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[0.78rem] transition-colors",
                        feeling === option
                          ? "border-rose-deep bg-rose-deep text-on-accent"
                          : "border-line bg-canvas text-ink-muted hover:border-rose-soft hover:text-ink",
                      )}
                    >
                      {titleCase(option)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="intensity" className="mb-0">
                    How strong is it?
                  </Label>
                  <span className="text-[0.76rem] tabular-nums text-ink-muted">{intensity}/5</span>
                </div>
                <input
                  id="intensity"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                  className="mt-3 w-full accent-[#FF2E9A]"
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="reflection">Anything you want to put down? (optional)</Label>
                <Textarea
                  id="reflection"
                  value={reflection}
                  onChange={(event) => setReflection(event.target.value)}
                  placeholder="No pressure. One sentence is enough."
                />
              </div>

              <div className="mt-5">
                <Label htmlFor="tags">Tags (optional, comma separated)</Label>
                <input
                  id="tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="school, family, tired, us"
                  className="field"
                />
              </div>

              {error ? <p className="mt-4 text-[0.8rem] text-error">{error}</p> : null}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button onClick={savePrivate} disabled={!feeling || busy} className="sm:flex-1">
                  <Lock className="h-4 w-4" />
                  {busy ? "Saving…" : "Keep it to myself"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setMode("review")}
                  disabled={!feeling}
                  className="sm:flex-1"
                >
                  <Send className="h-4 w-4" />
                  Send to Papi
                </Button>
              </div>

              <p className="mt-3 text-center text-[0.72rem] leading-relaxed text-ink-muted">
                Keeping it is the default. Sending always shows you the message first.
                {backendConfigured ? "" : " Sending is offline in this build — you'll get a copy option instead."}
              </p>
            </>
          )}
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Recent check-ins</p>
            <span className="text-[0.72rem] text-ink-muted">{history.length} saved</span>
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-line px-5 py-10 text-center">
              <p className="font-display text-lg text-ink">Nothing here yet.</p>
              <p className="mt-1 text-[0.8rem] text-ink-muted">Your first check-in will show up here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((entry) => (
                <Reveal key={entry.id} delay={0.03}>
                  <li className="rounded-xl2 border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.86rem] font-medium text-ink">
                          {titleCase(entry.feeling)}
                          <span className="ml-2 text-[0.72rem] font-normal text-ink-muted">
                            {entry.intensity}/5
                          </span>
                        </p>
                        <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted">
                          {relativeDay(entry.createdAt)} · {entry.shared ? "shared with Papi" : "private"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteFeeling(entry.id);
                          await refresh();
                        }}
                        aria-label="Delete check-in"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted/60 hover:bg-error/5 hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {entry.reflection ? (
                      <p className="mt-2 line-clamp-3 text-[0.82rem] leading-relaxed text-ink-muted">
                        {entry.reflection}
                      </p>
                    ) : null}
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
