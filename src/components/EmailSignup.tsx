import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/surface";
import { site } from "@/config/site";
import { backendConfigured, subscribeEmail } from "@/lib/backend";

type Status = "idle" | "sending" | "done" | "error";

export function EmailSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setMessage("");
    try {
      await subscribeEmail(email.trim(), site.timezone);
      setStatus("done");
      setMessage("You're on the list. Check your inbox for a note from me.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-start gap-3 rounded-xl2 border border-success/25 bg-success/5 px-5 py-4">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <p className="text-[0.86rem] leading-relaxed text-ink">{message}</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="email-signup" className="sr-only">
          Email address
        </label>
        <Input
          id="email-signup"
          type="email"
          required
          autoComplete="email"
          placeholder="your email, sunshine"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="sm:flex-1"
        />
        <Button type="submit" size="md" disabled={status === "sending"} className="shrink-0">
          {status === "sending" ? "Adding you…" : "Send me notes"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {!backendConfigured ? (
        <p className="mt-3 text-[0.76rem] leading-relaxed text-ink-muted">
          Email isn't switched on in this build yet — everything else works.
        </p>
      ) : (
        <p className="mt-3 text-[0.76rem] leading-relaxed text-ink-muted">
          One short note in the morning. A link back here. You can stop them any time.
        </p>
      )}

      {status === "error" ? (
        <p className="mt-2 text-[0.78rem] leading-relaxed text-error">{message}</p>
      ) : null}

      {compact ? null : (
        <p className="mt-4 text-[0.72rem] leading-relaxed text-ink-muted/80">
          We only use it for these notes. No sharing, no clever marketing, no spam.
        </p>
      )}
    </div>
  );
}
