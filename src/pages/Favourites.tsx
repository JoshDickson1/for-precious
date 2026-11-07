import { useEffect, useState } from "react";
import { Bookmark, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Input, Label, Textarea } from "@/components/ui/surface";
import { deleteFavourite, listFavourites, saveFavourite } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Favourite, FavouriteKind } from "@/types";

const kinds: { id: FavouriteKind; label: string }[] = [
  { id: "song", label: "Songs" },
  { id: "book", label: "Books" },
  { id: "film", label: "Films & shows" },
  { id: "place", label: "Places" },
  { id: "want", label: "Things I want" },
  { id: "outfit", label: "Outfit inspo" },
  { id: "idea", label: "Ideas" },
  { id: "other", label: "Other" },
];

const labelFor = (kind: FavouriteKind) => kinds.find((item) => item.id === kind)?.label ?? "Other";

export default function Favourites() {
  const [items, setItems] = useState<Favourite[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filter, setFilter] = useState<"all" | FavouriteKind>("all");
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<FavouriteKind>("song");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function refresh() {
    try {
      setItems(await listFavourites());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function add() {
    if (!title.trim()) {
      setError("It needs a name, at least.");
      return;
    }
    try {
      await saveFavourite({ kind, title: title.trim(), note: note.trim(), link: link.trim() });
      await refresh();
      setTitle("");
      setNote("");
      setLink("");
      setAdding(false);
      setError("");
    } catch {
      setError("Couldn't save that. Try again.");
    }
  }

  async function remove(id: string) {
    if (pendingDelete !== id) {
      setPendingDelete(id);
      window.setTimeout(() => setPendingDelete((current) => (current === id ? null : current)), 3000);
      return;
    }
    await deleteFavourite(id);
    setPendingDelete(null);
    await refresh();
  }

  const visible = filter === "all" ? items : items.filter((item) => item.kind === filter);
  const presentKinds = kinds.filter((item) => items.some((entry) => entry.kind === item.id));

  return (
    <div>
      <PageHeader
        eyebrow="My space · Favourites"
        title="Things you like."
        intro="A shelf for songs, places, ideas, and the things you keep meaning to buy. No algorithm, no feed. Just yours."
        aside={
          <Button onClick={() => setAdding((current) => !current)}>
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {adding ? "Close" : "Add something"}
          </Button>
        }
      />

      {adding ? (
        <Card className="mt-6 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="kind">Kind</Label>
              <select
                id="kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as FavouriteKind)}
                className="field"
              >
                {kinds.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="title">What is it?</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Song, book, place, idea…"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="note">Why you like it (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="The reason, the memory, the vibe."
              className="min-h-20"
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://"
            />
          </div>

          {error ? <p className="mt-3 text-[0.8rem] text-error">{error}</p> : null}

          <div className="mt-5 flex gap-2">
            <Button onClick={add}>Save it</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      {items.length > 0 ? (
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[0.74rem] transition-colors",
              filter === "all" ? "border-rose-deep bg-rose-deep text-on-accent" : "border-line text-ink-muted",
            )}
          >
            All · {items.length}
          </button>
          {presentKinds.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[0.74rem] transition-colors",
                filter === item.id ? "border-rose-deep bg-rose-deep text-on-accent" : "border-line text-ink-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        {status === "loading" ? (
          <p className="py-10 text-center text-sm text-ink-muted">Opening the shelf…</p>
        ) : status === "error" ? (
          <EmptyState title="This browser isn't letting me in." body="Try a normal window, and the shelf will open normally." />
        ) : items.length === 0 ? (
          <EmptyState
            title="The shelf is empty."
            body="Start with one song you can't stop playing, or one place you want to go. It adds up."
            action={
              <Button onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4" />
                Add the first thing
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">Nothing in that category yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item, index) => (
              <Reveal key={item.id} delay={Math.min(index * 0.03, 0.2)}>
                <li className="group relative h-full rounded-xl2 border border-line bg-surface p-5 transition-colors hover:border-rose-soft">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-blush px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-rose-deep">
                      {labelFor(item.kind)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={pendingDelete === item.id ? "Confirm remove" : "Remove"}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:bg-error/5 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                        pendingDelete === item.id ? "text-error opacity-100" : "text-ink-muted",
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h2 className="mt-4 font-display text-xl leading-snug text-ink">{item.title}</h2>
                  {item.note ? (
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-muted">{item.note}</p>
                  ) : null}

                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-[0.74rem] font-medium text-rose-deep"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-[0.72rem] text-ink-muted">
        <Bookmark className="h-3 w-3" />
        Saved on this device only.
      </p>
    </div>
  );
}
