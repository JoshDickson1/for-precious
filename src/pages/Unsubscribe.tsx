import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, MailX } from "lucide-react";
import { Lily } from "@/components/floral/Lily";
import { Button } from "@/components/ui/button";
import { unsubscribeEmail } from "@/lib/backend";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) setState("idle");
  }, [token]);

  async function handleUnsubscribe() {
    setState("sending");
    try {
      await unsubscribeEmail(token);
      setState("done");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "That didn't work. Try the link in the email again.");
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Lily size={130} />

      {state === "done" ? (
        <>
          <p className="eyebrow mt-5">Done</p>
          <h1 className="mt-3 font-display text-display-md text-ink">No more morning notes.</h1>
          <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-ink-muted">
            You won't get another one. The site is still here whenever you want it.
          </p>
          <Link to="/" className="mt-7 inline-flex h-11 items-center rounded-full bg-rose-deep px-6 text-[0.86rem] font-medium text-on-accent">
            Back to the little world
          </Link>
        </>
      ) : (
        <>
          <p className="eyebrow mt-5">Morning notes</p>
          <h1 className="mt-3 font-display text-display-md text-balance text-ink">
            {token ? "Stop the daily emails?" : "This link is missing its key."}
          </h1>
          <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-ink-muted">
            {token
              ? "One tap and they stop. No questions, no guilt trip, no 'are you sure' loop."
              : "Open the unsubscribe link at the bottom of the email instead — it carries the right key."}
          </p>

          {token ? (
            <Button className="mt-7" onClick={handleUnsubscribe} disabled={state === "sending"}>
              {state === "sending" ? (
                "Stopping…"
              ) : state === "error" ? (
                <>
                  <MailX className="h-4 w-4" /> Try again
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Yes, stop them
                </>
              )}
            </Button>
          ) : (
            <Link to="/" className="mt-7 inline-flex h-11 items-center rounded-full border border-line px-6 text-[0.86rem] text-ink">
              Back home
            </Link>
          )}

          {state === "error" ? <p className="mt-4 max-w-sm text-[0.8rem] text-error">{message}</p> : null}
        </>
      )}
    </div>
  );
}
