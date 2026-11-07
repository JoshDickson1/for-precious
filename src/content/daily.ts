import type { DailyItem, DailyType } from "@/types";
import { hashString } from "@/lib/date";

const notes: DailyItem[] = [
  { id: "n01", type: "note", body: "You added me on LinkedIn like it was a normal Tuesday. It was not a normal Tuesday." },
  { id: "n02", type: "note", body: "I had your number for a while and did nothing with it. Then you found me first. I still think about that." },
  { id: "n03", type: "note", body: "\"Babe.\" — \"Baber.\" That's the whole conversation. That's the whole relationship." },
  { id: "n04", type: "note", body: "You tease me like it's your full-time job. I've decided to keep employing you." },
  { id: "n05", type: "note", body: "The way you get me without me explaining is the scariest, best thing about us." },
  { id: "n06", type: "note", body: "Sunshine, if today is heavy, do less. I'll still be here at the end of it." },
  { id: "n07", type: "note", body: "You're a 400-level law student. Whatever you're worried about today is probably smaller than you." },
  { id: "n08", type: "note", body: "I like meeting you in the evening when campus goes quiet. That's my favourite part of the day." },
  { id: "n09", type: "note", body: "Pumpkin. Drink water. I'm serious." },
  { id: "n10", type: "note", body: "Someone asked how we met. I said \"ADR, then LinkedIn, then she started it.\" She started it, by the way." },
  { id: "n11", type: "note", body: "You make me laugh in the middle of sentences. That's a skill." },
  { id: "n12", type: "note", body: "I built an entire website because of you. That's embarrassing. Anyway." },
];

const affirmations: DailyItem[] = [
  { id: "a01", type: "affirmation", body: "You are allowed to take up space." },
  { id: "a02", type: "affirmation", body: "You don't have to earn rest." },
  { id: "a03", type: "affirmation", body: "You are becoming someone you'd be proud of." },
  { id: "a04", type: "affirmation", body: "Being soft is not the same as being weak." },
  { id: "a05", type: "affirmation", body: "You are more than what you produced today." },
  { id: "a06", type: "affirmation", body: "You are loved on your loudest days and your quietest ones." },
  { id: "a07", type: "affirmation", body: "You are allowed to change your mind." },
  { id: "a08", type: "affirmation", body: "The version of you that's still figuring it out is worthy too." },
];

const prompts: DailyItem[] = [
  { id: "p01", type: "prompt", body: "What's one small thing that made today easier?" },
  { id: "p02", type: "prompt", body: "What are you carrying that you could put down for tonight?" },
  { id: "p03", type: "prompt", body: "Who or what made you laugh today?" },
  { id: "p04", type: "prompt", body: "What's one thing you're looking forward to this week?" },
  { id: "p05", type: "prompt", body: "What's something you'd tell the version of you from last year?" },
  { id: "p06", type: "prompt", body: "What did you do today that nobody noticed?" },
  { id: "p07", type: "prompt", body: "What's a small thing you want to remember about this month?" },
  { id: "p08", type: "prompt", body: "What would make tomorrow 10% gentler?" },
];

const discoveries: DailyItem[] = [
  { id: "d01", type: "discovery", body: "In flower language, lilies were given for devotion. You already knew that, though." },
  { id: "d02", type: "discovery", body: "A lily can grow again from a single scale of its bulb. Quiet things come back." },
  { id: "d03", type: "discovery", body: "White lilies open in the evening. So do most of our best conversations." },
  { id: "d04", type: "discovery", body: "Lilies can take a whole year to bloom. Some things are worth the wait. (Yes, this is about you.)" },
];

export const dailyPool: DailyItem[] = [
  ...notes,
  ...notes,
  ...notes,
  ...notes,
  ...affirmations,
  ...prompts,
  ...discoveries,
];

export const scheduledDaily: DailyItem[] = [
  {
    id: "s01",
    type: "note",
    scheduledFor: "2026-12-21",
    body: "Two months, sunshine. You never asked what the countdown was for. I noticed.",
  },
];

export function dailyItemFor(dayKey: string): DailyItem {
  const scheduled = scheduledDaily.find((item) => item.scheduledFor === dayKey);
  if (scheduled) return scheduled;
  const index = hashString(dayKey) % dailyPool.length;
  return dailyPool[index];
}

const dailyGroups: Record<DailyType, DailyItem[]> = {
  note: notes,
  affirmation: affirmations,
  prompt: prompts,
  discovery: discoveries,
};

export const dailyByType = (type: DailyType): DailyItem[] => dailyGroups[type];

export const featuredDaily = notes.slice(0, 4);
