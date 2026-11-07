import { features } from "@/config/features";

export const site = {
  name: "For Precious",
  domain: "forprecious.love",
  url: "https://forprecious.love",
  description: "A little world made for one person.",

  her: {
    fullName: "Precious Uchechi Okonkwo",
    name: "Precious",
    nicknames: ["Babe", "Baber", "Pumpkin", "My sunshine"],
    course: "400-level Law",
  },

  him: {
    name: "Papi",
    email: "",
    whatsapp: "",
  },

  timezone: "Africa/Lagos",

  countdown: {
    startedAt: "2026-10-21T00:00:00+01:00",
    targetAt: "2026-12-21T00:00:00+01:00",
    caption: "no questions. just trust me.",
  },

  email: {
    dailySendTime: "07:30",
    fromName: "For Precious",
    fromAddress: "notes@forprecious.love",
  },

  gate: {
    hint: "the word I gave you — check my last message",
  },

  reveal: {
    unlockedAfterMemories: 3,
  },
} as const;

export const nav = [
  { to: "/", label: "Home" },
  { to: "/our-story", label: "Our Story" },
  ...(features.littleThings
    ? [{ to: "/little-things", label: "Little Things" }]
    : []),
  ...(features.mySpace ? [{ to: "/my-space", label: "My Space" }] : []),
] as const;
