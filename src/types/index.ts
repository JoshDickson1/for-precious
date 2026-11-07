export type DatePrecision = "exact" | "month" | "unknown";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt: string;
  caption?: string;
  poster?: string;
}

export interface Memory {
  slug: string;
  title: string;
  eyebrow: string;
  date: string | null;
  datePrecision: DatePrecision;
  summary: string;
  body: string[];
  category: "beginning" | "us" | "firsts" | "later";
  order: number;
  published: boolean;
  cover?: MediaItem;
  media: MediaItem[];
}

export type DailyType = "note" | "affirmation" | "prompt" | "discovery";

export interface DailyItem {
  id: string;
  type: DailyType;
  body: string;
  signed?: string;
  scheduledFor?: string;
  image?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  category: NoteCategory;
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
  /** Saved on this device while the private space was unreachable. */
  pendingSync?: boolean;
}

export type NoteCategory =
  | "personal"
  | "ideas"
  | "reminders"
  | "gratitude"
  | "remember"
  | "free";

export type Feeling =
  | "happy"
  | "excited"
  | "calm"
  | "loved"
  | "grateful"
  | "tired"
  | "anxious"
  | "sad"
  | "frustrated"
  | "overwhelmed"
  | "unsure";

export interface FeelingsEntry {
  id: string;
  feeling: Feeling;
  intensity: number;
  reflection: string;
  tags: string[];
  createdAt: string;
  shared: boolean;
}

export interface DayPlan {
  id: string;
  planDate: string;
  tasks: string[];
  commitments: string;
  lookingForwardTo: string;
  noteForPapi: string;
  createdAt: string;
  submitted: boolean;
}

export type FavouriteKind =
  | "song"
  | "book"
  | "film"
  | "place"
  | "want"
  | "outfit"
  | "idea"
  | "other";

export interface Favourite {
  id: string;
  kind: FavouriteKind;
  title: string;
  note: string;
  link: string;
  createdAt: string;
}

export type RevealAnswer = "yes" | "think" | "no";

export interface RevealResponse {
  answer: RevealAnswer;
  activity?: string;
  customActivity?: string;
  preferredDate?: string;
  note?: string;
  createdAt: string;
}
