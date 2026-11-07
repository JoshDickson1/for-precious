import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Plus, Search, Star, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card, Chip, EmptyState, Input, Label, Textarea } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import { relativeDay } from "@/lib/date";
import { cacheNotes, deleteNote, exportLocalData, listNotes, markNoteSynced, saveNote } from "@/lib/storage";
import { deleteRemoteNote, fetchNotes, notesConfigured, saveRemoteNote } from "@/lib/backend";
import { newId } from "@/lib/utils";
import type { Note, NoteCategory } from "@/types";

const categories: { id: NoteCategory; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "ideas", label: "Ideas" },
  { id: "reminders", label: "Reminders" },
  { id: "gratitude", label: "Gratitude" },
  { id: "remember", label: "Remember this" },
  { id: "free", label: "Free writing" },
];

const categoryLabel = (id: NoteCategory) => categories.find((item) => item.id === id)?.label ?? "Note";

type Draft = {
  id?: string;
  title: string;
  body: string;
  category: NoteCategory;
  favourite: boolean;
};

const emptyDraft: Draft = { title: "", body: "", category: "personal", favourite: false };

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [source, setSource] = useState<"cloud" | "device">("device");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | NoteCategory>("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const local = await listNotes();

      if (!notesConfigured) {
        setNotes(local);
        setSource("device");
        setStatus("ready");
        return;
      }

      let remote: Note[];
      try {
        remote = await fetchNotes();
      } catch {
        setNotes(local);
        setSource("device");
        setStatus("ready");
        setMessage({
          tone: "error",
          text: "Can't reach your private space right now. Showing the copy saved on this device — nothing is lost.",
        });
        return;
      }

      const byId = new Map(remote.map((note) => [note.id, note]));
      const stillPending: Note[] = [];

      const toSync =
        remote.length === 0
          ? local.filter((note) => !note.pendingSync)
          : local.filter((note) => note.pendingSync);

      for (const note of toSync) {
        try {
          const saved = await saveRemoteNote(note);
          byId.set(saved.id, saved);
          await markNoteSynced(saved);
        } catch {
          stillPending.push(note);
          byId.set(note.id, note);
        }
      }

      const merged = [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      await cacheNotes(merged);
      setNotes(merged);
      setSource("cloud");
      setStatus("ready");

      if (stillPending.length > 0) {
        setMessage({
          tone: "error",
          text: `${stillPending.length} note${stillPending.length === 1 ? "" : "s"} still waiting to sync. Saved safely on this device.`,
        });
      }
    } catch {
      setStatus("error");
    }
  }

  async function persistNote(candidate: Note): Promise<boolean> {
    if (!notesConfigured) {
      await saveNote(candidate);
      return true;
    }

    try {
      const saved = await saveRemoteNote(candidate);
      await saveNote({ ...saved, pendingSync: false });
      return true;
    } catch {
      await saveNote({ ...candidate, pendingSync: true });
      return false;
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (draft) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [draft?.id]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesCategory = category === "all" || note.category === category;
      const matchesTerm =
        term.length === 0 ||
        note.title.toLowerCase().includes(term) ||
        note.body.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [notes, query, category]);

  async function handleSave() {
    if (!draft) return;
    if (!draft.body.trim() && !draft.title.trim()) {
      setMessage({ tone: "error", text: "Give it a title, a line, or both." });
      return;
    }
    setSaving(true);
    try {
      const existing = draft.id ? notes.find((note) => note.id === draft.id) : undefined;
      const now = new Date().toISOString();
      const candidate: Note = {
        id: draft.id ?? newId(),
        title: draft.title.trim(),
        body: draft.body,
        category: draft.category,
        favourite: draft.favourite,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const synced = await persistNote(candidate);
      await refresh();
      setDraft(null);

      if (!notesConfigured) {
        setMessage({ tone: "ok", text: "Saved on this device. Use Backup now and then." });
      } else if (synced) {
        setMessage({ tone: "ok", text: "Saved to your private space." });
      } else {
        setMessage({
          tone: "error",
          text: "Saved on this device. I'll sync it to your private space when the connection is back.",
        });
      }
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "That didn't save." });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFavourite(note: Note) {
    try {
      const synced = await persistNote({ ...note, favourite: !note.favourite, updatedAt: new Date().toISOString() });
      await refresh();
      if (!synced) {
        setMessage({ tone: "error", text: "Updated here. It'll sync when the connection is back." });
      }
    } catch {
      setMessage({ tone: "error", text: "Couldn't update that note." });
    }
  }

  async function handleDelete(id: string) {
    if (pendingDelete !== id) {
      setPendingDelete(id);
      window.setTimeout(() => setPendingDelete((current) => (current === id ? null : current)), 3000);
      return;
    }
    try {
      if (notesConfigured) {
        try {
          await deleteRemoteNote(id);
        } catch {
          setMessage({
            tone: "error",
            text: "Couldn't reach your private space, so the note is still there. Try again in a moment.",
          });
          setPendingDelete(null);
          return;
        }
      }
      await deleteNote(id);
      await refresh();
      setPendingDelete(null);
      if (draft?.id === id) setDraft(null);
      setMessage({ tone: "ok", text: "Deleted." });
    } catch {
      setMessage({ tone: "error", text: "Couldn't delete that note." });
    }
  }

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
      setMessage({ tone: "ok", text: "Backup downloaded. Keep it somewhere safe." });    } catch {
      setMessage({ tone: "error", text: "Couldn't build the backup." });
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="My space · Notes"
        title="Your notebook."
        intro="Thoughts, lists, half-formed ideas. Saved to your private space, so clearing Safari won't erase them."
        aside={
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Backup
            </Button>
            <Button size="md" onClick={() => setDraft({ ...emptyDraft })}>
              <Plus className="h-4 w-4" />
              New note
            </Button>
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip className={cn(source === "cloud" ? "border-success/30 bg-success/5 text-success" : "border-line")}>
          {!notesConfigured
            ? "This build saves on this device"
            : source === "cloud"
              ? "Synced to your private space"
              : "Showing the device copy"}
        </Chip>
        {notes.some((note) => note.pendingSync) ? (
          <span className="text-[0.74rem] text-ink-muted">
            {notes.filter((note) => note.pendingSync).length} waiting to sync
          </span>
        ) : null}
      </div>

      {!notesConfigured ? (
        <p className="mt-4 rounded-xl border border-line bg-blush/30 px-4 py-3 text-[0.8rem] leading-relaxed text-ink-muted">
          Private-space sync isn't switched on in this build yet, so notes live on this device. Use{" "}
          <strong className="font-medium text-ink">Backup</strong> until it is.
        </p>
      ) : null}

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

      <div ref={editorRef} className="scroll-mt-24">
        {draft ? (
          <Card className="mt-6 p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{draft.id ? "Editing" : "New note"}</p>
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="Close editor"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-blush hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              <div>
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Optional, but nice to have"
                />
              </div>

              <div>
                <Label htmlFor="note-body">Note</Label>
                <Textarea
                  id="note-body"
                  value={draft.body}
                  onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                  placeholder="Start anywhere."
                  className="min-h-52 font-sans"
                  autoFocus
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <Label htmlFor="note-category">Category</Label>
                  <select
                    id="note-category"
                    value={draft.category}
                    onChange={(event) => setDraft({ ...draft, category: event.target.value as NoteCategory })}
                    className="field"
                  >
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex h-11 items-center gap-2 text-[0.82rem] text-ink-muted">
                  <input
                    type="checkbox"
                    checked={draft.favourite}
                    onChange={(event) => setDraft({ ...draft, favourite: event.target.checked })}
                    className="h-4 w-4 accent-[#FF2E9A]"
                  />
                  Star this one
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save note"}
                </Button>
                <Button variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                {draft.id ? (
                  <Button
                    variant="danger"
                    className="ml-auto"
                    onClick={() => handleDelete(draft.id!)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {pendingDelete === draft.id ? "Tap again to delete" : "Delete"}
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your notes"
            aria-label="Search notes"
            className="pl-11"
          />
        </div>
        <div className="no-scrollbar flex flex-wrap gap-2 pb-1 sm:flex-nowrap sm:overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[0.74rem] transition-colors",
              category === "all" ? "border-rose-deep bg-rose-deep text-on-accent" : "border-line text-ink-muted",
            )}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[0.74rem] transition-colors",
                category === item.id ? "border-rose-deep bg-rose-deep text-on-accent" : "border-line text-ink-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {status === "loading" ? (
          <p className="py-10 text-center text-sm text-ink-muted">Opening your notebook…</p>
        ) : status === "error" ? (
          <EmptyState
            title="This browser isn't letting me in."
            body="Private windows and some strict settings block local storage. Try a normal window and your notes will save normally."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={notes.length === 0 ? "Nothing here yet." : "Nothing matches that."}
            body={
              notes.length === 0
                ? "Start with one sentence. It doesn't have to be profound — it just has to be yours."
                : "Try a different word, or clear the filter."
            }
            action={
              notes.length === 0 ? (
                <Button onClick={() => setDraft({ ...emptyDraft })}>
                  <Plus className="h-4 w-4" />
                  Write the first one
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((note, index) => (
              <Reveal key={note.id} delay={Math.min(index * 0.03, 0.2)}>
                <li>
                  <Card className="group h-full p-5 transition-colors hover:border-rose-soft">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            id: note.id,
                            title: note.title,
                            body: note.body,
                            category: note.category,
                            favourite: note.favourite,
                          })
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="eyebrow">
                          {categoryLabel(note.category)} · {relativeDay(note.updatedAt)}
                        </p>
                        <h2 className="mt-2 truncate font-display text-xl text-ink group-hover:text-rose-deep">
                          {note.title.trim() || note.body.trim().split("\n")[0] || "Untitled"}
                        </h2>
                        <p className="mt-1.5 line-clamp-3 text-[0.84rem] leading-relaxed text-ink-muted">
                          {note.body}
                        </p>
                      </button>

                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFavourite(note)}
                          aria-label={note.favourite ? "Remove star" : "Star this note"}
                          aria-pressed={note.favourite}
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-blush"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4 transition-colors",
                              note.favourite ? "fill-rose text-rose" : "text-ink-muted",
                            )}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          aria-label={pendingDelete === note.id ? "Confirm delete" : "Delete note"}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full hover:bg-error/5",
                            pendingDelete === note.id ? "text-error" : "text-ink-muted/60",
                          )}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
