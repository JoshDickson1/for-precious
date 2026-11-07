import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  DayPlan,
  Favourite,
  FeelingsEntry,
  Note,
  RevealResponse,
} from "@/types";
import { newId } from "@/lib/utils";

interface ForPreciousDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { "by-updated": string };
  };
  feelings: {
    key: string;
    value: FeelingsEntry;
    indexes: { "by-created": string };
  };
  plans: {
    key: string;
    value: DayPlan;
    indexes: { "by-date": string };
  };
  favourites: {
    key: string;
    value: Favourite;
    indexes: { "by-created": string };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

export class StorageUnavailableError extends Error {
  constructor() {
    super("This browser isn't letting us save anything locally. Try a normal (non-private) window.");
    this.name = "StorageUnavailableError";
  }
}

const DB_NAME = "for-precious";
const DB_VERSION = 1;
let dbPromise: Promise<IDBPDatabase<ForPreciousDB>> | null = null;

export function isStorageAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

function db(): Promise<IDBPDatabase<ForPreciousDB>> {
  if (!isStorageAvailable()) return Promise.reject(new StorageUnavailableError());
  if (!dbPromise) {
    dbPromise = openDB<ForPreciousDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        const notes = database.createObjectStore("notes", { keyPath: "id" });
        notes.createIndex("by-updated", "updatedAt");

        const feelings = database.createObjectStore("feelings", { keyPath: "id" });
        feelings.createIndex("by-created", "createdAt");

        const plans = database.createObjectStore("plans", { keyPath: "id" });
        plans.createIndex("by-date", "planDate");

        const favourites = database.createObjectStore("favourites", { keyPath: "id" });
        favourites.createIndex("by-created", "createdAt");

        database.createObjectStore("meta", { keyPath: "key" });
      },
      blocked() {
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

export async function listNotes(): Promise<Note[]> {
  const database = await db();
  const notes = await database.getAllFromIndex("notes", "by-updated");
  return notes.reverse();
}

export async function saveNote(input: {
  id?: string;
  title: string;
  body: string;
  category: Note["category"];
  favourite: boolean;
  createdAt?: string;
  updatedAt?: string;
  pendingSync?: boolean;
}): Promise<Note> {
  const database = await db();
  const now = new Date().toISOString();
  const existing = input.id ? await database.get("notes", input.id) : undefined;
  const note: Note = {
    id: input.id ?? newId(),
    title: input.title.trim(),
    body: input.body,
    category: input.category,
    favourite: input.favourite,
    createdAt: input.createdAt ?? existing?.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    ...(input.pendingSync ? { pendingSync: true } : {}),
  };
  await database.put("notes", note);
  return note;
}

export async function cacheNotes(notes: Note[]): Promise<void> {
  const database = await db();
  const transaction = database.transaction("notes", "readwrite");
  await transaction.store.clear();
  await Promise.all(notes.map((note) => transaction.store.put(note)));
  await transaction.done;
}

export async function markNoteSynced(note: Note): Promise<Note> {
  const database = await db();
  const synced: Note = { ...note, pendingSync: false };
  await database.put("notes", synced);
  return synced;
}

export async function deleteNote(id: string): Promise<void> {
  const database = await db();
  await database.delete("notes", id);
}

export async function listFeelings(): Promise<FeelingsEntry[]> {
  const database = await db();
  const entries = await database.getAllFromIndex("feelings", "by-created");
  return entries.reverse();
}

export async function saveFeeling(entry: Omit<FeelingsEntry, "id" | "createdAt">): Promise<FeelingsEntry> {
  const database = await db();
  const saved: FeelingsEntry = {
    ...entry,
    id: newId(),
    createdAt: new Date().toISOString(),
  };
  await database.put("feelings", saved);
  return saved;
}

export async function deleteFeeling(id: string): Promise<void> {
  const database = await db();
  await database.delete("feelings", id);
}

export async function listPlans(): Promise<DayPlan[]> {
  const database = await db();
  const plans = await database.getAllFromIndex("plans", "by-date");
  return plans.reverse();
}

export async function savePlan(plan: Omit<DayPlan, "id" | "createdAt"> & { id?: string; createdAt?: string }): Promise<DayPlan> {
  const database = await db();
  const saved: DayPlan = {
    ...plan,
    id: plan.id ?? newId(),
    createdAt: plan.createdAt ?? new Date().toISOString(),
  };
  await database.put("plans", saved);
  return saved;
}

export async function listFavourites(): Promise<Favourite[]> {
  const database = await db();
  const items = await database.getAllFromIndex("favourites", "by-created");
  return items.reverse();
}

export async function saveFavourite(item: Omit<Favourite, "id" | "createdAt">): Promise<Favourite> {
  const database = await db();
  const saved: Favourite = { ...item, id: newId(), createdAt: new Date().toISOString() };
  await database.put("favourites", saved);
  return saved;
}

export async function deleteFavourite(id: string): Promise<void> {
  const database = await db();
  await database.delete("favourites", id);
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const database = await db();
  const record = await database.get("meta", key);
  return record?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const database = await db();
  await database.put("meta", { key, value });
}

export async function getRevealResponse(): Promise<RevealResponse | undefined> {
  return getMeta<RevealResponse>("reveal-response");
}

export async function setRevealResponse(response: RevealResponse): Promise<void> {
  await setMeta("reveal-response", response);
}

export async function exportLocalData(): Promise<string> {
  const database = await db();
  const [notes, feelings, plans, favourites] = await Promise.all([
    database.getAll("notes"),
    database.getAll("feelings"),
    database.getAll("plans"),
    database.getAll("favourites"),
  ]);
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), notes, feelings, plans, favourites },
    null,
    2,
  );
}

export async function clearLocalData(): Promise<void> {
  const database = await db();
  await Promise.all([
    database.clear("notes"),
    database.clear("feelings"),
    database.clear("plans"),
    database.clear("favourites"),
  ]);
}
