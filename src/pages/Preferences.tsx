import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Lock, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { EmailSignup } from "@/components/EmailSignup";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { fetchNotes, notesConfigured } from "@/lib/backend";
import { lock } from "@/lib/gate";
import { clearLocalData, exportLocalData, listFavourites, listFeelings, listNotes, listPlans } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function Preferences() {
  const [counts, setCounts] = useState({ notes: 0, feelings: 0, plans: 0, favourites: 0 });
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [notes, feelings, plans, favourites] = await Promise.all([
          notesConfigured ? fetchNotes().catch(() => listNotes()) : listNotes(),
          listFeelings(),
          listPlans(),
          listFavourites(),
        ]);
        setCounts({
          notes: notes.length,
          feelings: feelings.length,
          plans: plans.length,
          favourites: favourites.length,
        });
      } catch {
        /* counts are cosmetic here */
      }
    })();
  }, []);

  async function handleExport() {
    try {
      const data = await exportLocalData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `for-precious-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ tone: "ok", text: "Backup downloaded." });
    } catch {
      setMessage({ tone: "error", text: "Couldn't build the backup in this browser." });
    }
  }

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      window.setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    try {
      await clearLocalData();
      setCounts({ notes: 0, feelings: 0, plans: 0, favourites: 0 });
      setConfirmClear(false);
      setMessage({
        tone: "ok",
        text: "This device's copy is gone. Notes in your private space are still there.",
      });
    } catch {
      setMessage({ tone: "error", text: "Couldn't clear this browser's storage." });
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Preferences"
        title="The housekeeping."
        intro="Small controls for your inbox, your data, and this device. Nothing dramatic."
      />

      {message ? (
        <p
          className={cn(
            "mt-6 rounded-xl border px-4 py-3 text-[0.82rem]",
            message.tone === "ok"
              ? "border-success/25 bg-success/5 text-success"
              : "border-error/25 bg-error/5 text-error",
          )}
        >
          {message.text}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-rose" />
            <h2 className="font-display text-2xl text-ink">Morning notes</h2>
          </div>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-muted">
            One short email in the morning, with a link back here. That's the whole deal.
          </p>
          <div className="mt-5">
            <EmailSignup compact />
          </div>
          <div className="mt-5 border-t border-line pt-4 text-[0.76rem] leading-relaxed text-ink-muted">
            <p>Want to pause or stop them? Use the link at the bottom of any email — it works immediately.</p>
            <Link to="/privacy" className="mt-2 inline-block font-medium text-rose-deep">
              Read the privacy note
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-rose" />
            <h2 className="font-display text-2xl text-ink">Your things, and this device</h2>
          </div>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-muted">
            Notes are synced to your private space. Check-ins, plans and favourites stay in this browser — they
            don't follow you to another phone.
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-[0.8rem]">
            {[
              ["Notes", counts.notes],
              ["Check-ins", counts.feelings],
              ["Plans", counts.plans],
              ["Favourites", counts.favourites],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-line bg-canvas px-3 py-2.5">
                <dt className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted">{label}</dt>
                <dd className="mt-1 font-display text-xl text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Download a backup
            </Button>
            <Button variant="danger" onClick={handleClear}>
              <Trash2 className="h-3.5 w-3.5" />
              {confirmClear ? "Tap again to erase" : "Erase this device's copy"}
            </Button>
          </div>
          <p className="mt-3 text-[0.72rem] leading-relaxed text-ink-muted">
            This clears the local copy only. Notes in your private space stay there.
          </p>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Leaving this device open?</h2>
              <p className="mt-1 max-w-lg text-[0.84rem] leading-relaxed text-ink-muted">
                Lock it and the passphrase is needed again. Useful if someone else picks up your phone.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                lock();
                window.location.assign("/");
              }}
            >
              <Lock className="h-4 w-4" />
              Lock this device
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
