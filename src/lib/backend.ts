import type { SupabaseClient } from "@supabase/supabase-js";
import type { DayPlan, FeelingsEntry, Note } from "@/types";
import { getSiteKey } from "@/lib/gate";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const backendConfigured = Boolean(url && anonKey);
export const notesConfigured = backendConfigured;

let clientPromise: Promise<SupabaseClient> | null = null;

function getClient(): Promise<SupabaseClient> | null {
  if (!url || !anonKey) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url, anonKey, { auth: { persistSession: false } }),
    );
  }
  return clientPromise;
}

export class BackendError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "BackendError";
  }
}

const NOT_CONNECTED = new BackendError(
  "not_connected",
  "The posting side isn't connected yet. You can copy it and send it straight to Papi instead.",
);

async function invoke<T>(
  name: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<T> {
  const client = getClient();
  if (!client) throw NOT_CONNECTED;
  const { data, error } = await (await client).functions.invoke(name, { body, headers });
  if (error) {
    throw new BackendError("request_failed", error.message || "That didn't go through. Try again in a moment.");
  }
  const result = data as { error?: string } | null;
  if (result?.error) {
    throw new BackendError("rejected", result.error);
  }
  return data as T;
}

export async function fetchNotes(): Promise<Note[]> {
  const { notes } = await invoke<{ notes: Note[] }>(
    "notes",
    { action: "list" },
    { "x-site-key": getSiteKey() },
  );
  return notes;
}

export async function saveRemoteNote(note: Note): Promise<Note> {
  const { note: saved } = await invoke<{ note: Note }>(
    "notes",
    {
      action: "save",
      note: {
        id: note.id,
        title: note.title,
        body: note.body,
        category: note.category,
        favourite: note.favourite,
        createdAt: note.createdAt,
      },
    },
    { "x-site-key": getSiteKey() },
  );
  return saved;
}

export async function deleteRemoteNote(id: string): Promise<void> {
  await invoke("notes", { action: "delete", id }, { "x-site-key": getSiteKey() });
}

export async function subscribeEmail(email: string, timezone: string): Promise<{ status: "active" | "pending" }> {
  return invoke("subscribe", { email, timezone, consent: true });
}

export async function unsubscribeEmail(token: string): Promise<{ status: "unsubscribed" }> {
  return invoke("unsubscribe", { token });
}

export async function submitDayPlan(plan: DayPlan): Promise<{ status: "sent" }> {
  return invoke("submit-day-plan", {
    planDate: plan.planDate,
    tasks: plan.tasks,
    commitments: plan.commitments,
    lookingForwardTo: plan.lookingForwardTo,
    noteForPapi: plan.noteForPapi,
    shared: true,
    idempotencyKey: plan.id,
  });
}

export async function submitFeelings(entry: FeelingsEntry): Promise<{ status: "sent" }> {
  return invoke("submit-feelings", {
    feeling: entry.feeling,
    intensity: entry.intensity,
    reflection: entry.reflection,
    tags: entry.tags,
    shared: true,
  });
}

export async function submitAnswer(input: {
  answer: string;
  activity?: string;
  customActivity?: string;
  preferredDate?: string;
  note?: string;
}): Promise<{ status: "sent" }> {
  return invoke("submit-answer", input);
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
