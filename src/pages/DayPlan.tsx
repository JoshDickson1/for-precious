import { useEffect, useState } from "react";
import { CalendarDays, Check, Copy, MessageCircle, Plus, Save, Send, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card, Label } from "@/components/ui/surface";
import { backendConfigured, whatsappShareUrl, submitDayPlan } from "@/lib/backend";
import { dayKey } from "@/lib/date";
import { site } from "@/config/site";
import { listPlans, savePlan } from "@/lib/storage";
import { newId } from "@/lib/utils";
import type { DayPlan as DayPlanType } from "@/types";

type Mode = "edit" | "review" | "sent" | "fallback";

function readableDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

export default function DayPlan() {
  const [planDate, setPlanDate] = useState(() => dayKey(new Date(), site.timezone));
  const [tasks, setTasks] = useState<string[]>(["", "", ""]);
  const [commitments, setCommitments] = useState("");
  const [lookingForwardTo, setLookingForwardTo] = useState("");
  const [noteForPapi, setNoteForPapi] = useState("");
  const [mode, setMode] = useState<Mode>("edit");
  const [draftPlan, setDraftPlan] = useState<DayPlanType | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [history, setHistory] = useState<DayPlanType[]>([]);

  async function refresh() {
    try {
      setHistory(await listPlans());
    } catch {
      setError("This browser isn't letting me read your saved plans.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const cleanTasks = tasks.map((task) => task.trim()).filter(Boolean);

  function buildPlan(): DayPlanType {
    return {
      id: newId(),
      planDate,
      tasks: cleanTasks,
      commitments: commitments.trim(),
      lookingForwardTo: lookingForwardTo.trim(),
      noteForPapi: noteForPapi.trim(),
      createdAt: new Date().toISOString(),
      submitted: false,
    };
  }

  function review() {
    if (cleanTasks.length === 0 && !commitments.trim()) {
      setError("Give me at least one thing you're doing, or one commitment.");
      return;
    }
    setError("");
    setDraftPlan(buildPlan());
    setMode("review");
  }

  async function saveDraft() {
    setBusy(true);
    setError("");
    try {
      await savePlan(buildPlan());
      await refresh();
      setError("");
      setDraftSaved(true);
      window.setTimeout(() => setDraftSaved(false), 2500);
      setBusy(false);
      return;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't save the draft.");
    }
    setBusy(false);
  }

  async function confirmSend() {
    if (!draftPlan) return;
    setBusy(true);
    setError("");
    try {
      await submitDayPlan(draftPlan);
      await savePlan({ ...draftPlan, submitted: true });
      await refresh();
      setMode("sent");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That didn't send.");
      try {
        await savePlan(draftPlan);
        await refresh();
      } catch {
        /* draft remains in memory */
      }
      setMode("fallback");
    } finally {
      setBusy(false);
    }
  }

  const shareText = draftPlan
    ? [
        `My plan — ${readableDate(draftPlan.planDate)}`,
        "",
        ...draftPlan.tasks.map((task) => `• ${task}`),
        draftPlan.commitments ? `\nCommitments: ${draftPlan.commitments}` : "",
        draftPlan.lookingForwardTo ? `Looking forward to: ${draftPlan.lookingForwardTo}` : "",
        draftPlan.noteForPapi ? `\nFor Papi: ${draftPlan.noteForPapi}` : "",
      ]
        .filter((line) => line !== "")
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

  function resetForm() {
    setTasks(["", "", ""]);
    setCommitments("");
    setLookingForwardTo("");
    setNoteForPapi("");
    setDraftPlan(null);
    setMode("edit");
    setError("");
  }

  return (
    <div>
      <PageHeader
        eyebrow="My space · Day plan"
        title="What's today looking like?"
        intro="The ritual, but easier. Tell me your day and I'll be less annoying about asking."
        aside={<CalendarDays className="h-6 w-6 text-rose" strokeWidth={1.4} />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5 sm:p-7">
          {mode === "sent" ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blush">
                <Check className="h-5 w-5 text-rose-deep" />
              </div>
              <h2 className="mt-5 font-display text-2xl text-ink">Got it, sunshine.</h2>
              <p className="mt-2 max-w-xs text-[0.86rem] leading-relaxed text-ink-muted">
                Sent to Papi. He's reading it right now, probably nodding like he's your manager.
              </p>
              <Button variant="secondary" className="mt-6" onClick={resetForm}>
                Plan another day
              </Button>
            </div>
          ) : mode === "review" || mode === "fallback" ? (
            <div>
              <p className="eyebrow">{mode === "review" ? "One last look" : "Sending isn't connected"}</p>
              <h2 className="mt-2 font-display text-2xl text-ink">
                {mode === "review" ? "This is what Papi gets." : "Send it to him yourself."}
              </h2>

              <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-line bg-canvas p-4 font-sans text-[0.84rem] leading-relaxed text-ink">
                {shareText}
              </pre>

              {mode === "review" ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={confirmSend} disabled={busy}>
                    <Send className="h-4 w-4" />
                    {busy ? "Sending…" : "Send to Papi"}
                  </Button>
                  <Button variant="ghost" onClick={() => setMode("edit")} disabled={busy}>
                    Go back
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
                  <Button variant="ghost" onClick={() => setMode("edit")}>
                    Back
                  </Button>
                </div>
              )}

              {error ? <p className="mt-3 text-[0.78rem] text-error">{error}</p> : null}
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="plan-date">The day</Label>
                  <input
                    id="plan-date"
                    type="date"
                    value={planDate}
                    onChange={(event) => setPlanDate(event.target.value)}
                    className="field"
                  />
                </div>
                <div className="flex items-end">
                  <p className="pb-3 text-[0.8rem] text-ink-muted">{readableDate(planDate)}</p>
                </div>
              </div>

              <div className="mt-6">
                <Label>What I'm doing</Label>
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-4 text-center font-display text-sm text-rose-soft">{index + 1}</span>
                      <input
                        value={task}
                        onChange={(event) => {
                          const next = [...tasks];
                          next[index] = event.target.value;
                          setTasks(next);
                        }}
                        placeholder={index === 0 ? "The main thing" : "Another thing"}
                        aria-label={`Task ${index + 1}`}
                        className="field"
                      />
                      {tasks.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setTasks(tasks.filter((_, taskIndex) => taskIndex !== index))}
                          aria-label={`Remove task ${index + 1}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-blush hover:text-ink"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTasks([...tasks, ""])}
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-rose-deep"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add another
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <Label htmlFor="commitments">Classes, meetings, obligations</Label>
                  <input
                    id="commitments"
                    value={commitments}
                    onChange={(event) => setCommitments(event.target.value)}
                    placeholder="The things you can't move"
                    className="field"
                  />
                </div>
                <div>
                  <Label htmlFor="looking">Something I'm looking forward to</Label>
                  <input
                    id="looking"
                    value={lookingForwardTo}
                    onChange={(event) => setLookingForwardTo(event.target.value)}
                    placeholder="Even if it's small"
                    className="field"
                  />
                </div>
                <div>
                  <Label htmlFor="note">Anything for Papi (optional)</Label>
                  <textarea
                    id="note"
                    value={noteForPapi}
                    onChange={(event) => setNoteForPapi(event.target.value)}
                    placeholder="A request, a warning, a joke. All welcome."
                    className="field min-h-24 resize-y"
                  />
                </div>
              </div>

              {error ? <p className="mt-4 text-[0.8rem] text-error">{error}</p> : null}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button onClick={review} className="sm:flex-1">
                  <Send className="h-4 w-4" />
                  Review & send
                </Button>
                <Button variant="secondary" onClick={saveDraft} disabled={busy}>
                  {draftSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {draftSaved ? "Draft saved" : "Save a draft"}
                </Button>
              </div>

              <p className="mt-3 text-center text-[0.72rem] leading-relaxed text-ink-muted">
                Drafts stay on this device. Nothing is sent until you confirm it.
                {backendConfigured ? "" : " Sending is offline in this build — you'll get a copy option instead."}
              </p>
            </>
          )}
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Recent plans</p>
            <span className="text-[0.72rem] text-ink-muted">{history.length} saved</span>
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-line px-5 py-10 text-center">
              <p className="font-display text-lg text-ink">No plans yet.</p>
              <p className="mt-1 text-[0.8rem] text-ink-muted">Send the first one and it'll live here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((plan) => (
                <Reveal key={plan.id} delay={0.03}>
                  <li className="rounded-xl2 border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-lg text-ink">{readableDate(plan.planDate)}</p>
                      <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted">
                        {plan.submitted ? "sent" : "draft"}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {plan.tasks.slice(0, 4).map((task, index) => (
                        <li key={index} className="flex gap-2 text-[0.82rem] leading-relaxed text-ink-muted">
                          <span className="text-rose-soft">·</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                    {plan.tasks.length > 4 ? (
                      <p className="mt-1 text-[0.72rem] text-ink-muted">+{plan.tasks.length - 4} more</p>
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
