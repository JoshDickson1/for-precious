export const introStages = [
  {
    id: "found",
    eyebrow: "You found it",
    title: "This part wasn't on the tour.",
    paragraphs: [
      "Everything before this — the notes, the little things, the story — was me warming up.",
      "This is the part I actually wanted to say. Take your time.",
    ],
  },
  {
    id: "why",
    eyebrow: "Why all this",
    title: "I'm not good at saying big things out loud.",
    paragraphs: [
      "I start joking halfway through and ruin the moment. So I built a website instead, which is objectively the most dramatic thing I have ever done.",
      "But you deserve the unedited version. So here it is, in writing, where I can't talk over myself.",
    ],
  },
] as const;

export const letter = {
  greeting: "Precious,",
  paragraphs: [
    "Somewhere between ADR and LinkedIn and the first time I saw you on the ninth of October, you stopped being someone I was talking to and became someone I was planning around. I don't think you noticed it happening. I did.",
    "You get me. Not the polished version — the actual one. You also tease me like it's a sport, and I have decided I like that about you more than I should.",
    "I don't want to be casual about you. I want to be deliberate. I want to show up on time, with a plan and a terrible joke, and stay after the joke lands badly.",
    "So I'm going to stop hiding behind all this design and ask you properly.",
  ],
  signoff: "Always yours,",
  signature: "Papi",
} as const;

export const question = {
  eyebrow: "The actual question",
  title: "Will you go out with me?",
  subtitle:
    "Officially. On purpose. With a date in the calendar and everything. You can bring the attitude — I've already accounted for it.",
} as const;

export const answerCopy = {
  yes: {
    title: "She said yes.",
    body: "I knew you would. I was only 87% sure, which is basically certain. Now pick something and let me plan it properly.",
  },
  think: {
    title: "Take your time.",
    body: "Genuinely. This isn't going anywhere, and neither am I. Read it again tomorrow if you want.",
  },
  no: {
    title: "That's okay.",
    body: "Thank you for reading all of it — I know it was a lot. This little world stays yours either way.",
  },
} as const;

export const dateOptions = [
  { id: "arcade", label: "The arcade", detail: "The one we've already been planning. You will lose." },
  { id: "dinner", label: "Dinner somewhere quiet", detail: "Somewhere we can talk for three hours and forget to leave." },
  { id: "cinema", label: "Cinema", detail: "You pick the film. I'll pretend I'm not judging." },
  { id: "walk", label: "A long walk and food after", detail: "Evening campus energy, but with no reason to rush back." },
  { id: "custom", label: "Let me pick", detail: "Tell me what you want and I'll make it happen." },
] as const;
