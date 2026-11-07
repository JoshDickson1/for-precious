# For Precious — Product Requirements

**Version:** 1.0
**Status:** Built (V1)
**Owner:** Papi
**Recipient:** Precious Uchechi Okonkwo
**Domain:** forprecious.love
**Platform:** Responsive web, mobile-first

---

## 1. What this is

A private digital world made for one person. It does three jobs:

1. **Tells the story** of how two people found each other, in five real chapters.
2. **Gives her something to use** — a notebook, a feelings check-in, a day-plan ritual, a shelf of favourite things, a morning email.
3. **Asks the question** — a letter and an invitation, reached at the end of the story rather than thrown at her on the first screen.

The gift is the whole product, not the landing page. If she never opens it again after the question, it has failed. If she opens it on a Tuesday to write down a thought, it has worked.

---

## 2. Decisions locked

| Decision | Choice |
| --- | --- |
| Domain | `forprecious.love`. `.mylove` is not a registrable TLD; `.love` is. |
| Hosting | Vercel (free), custom domain attached |
| Frontend | React 19 + TypeScript + Vite + Tailwind + Motion |
| Backend | Supabase (Postgres + Edge Functions) |
| Email | Resend, single opt-in, unsubscribe in every email |
| Countdown start | 21 October 2026 |
| Countdown target | 21 December 2026, Africa/Lagos |
| Countdown meaning | Never stated. She guesses. |
| Countdown placement | Near the bottom of the home page |
| Reveal framing | They are already together; the question is a formal, deliberate "go out with me", not a pretend first meeting |
| Reveal placement | A separate page reached after the story; never the first screen |
| Privacy | Local-first for private things; explicit send for anything shared |
| Access | Soft passphrase gate (a door, not encryption) |
| Accounts | V2 |
| Admin dashboard | V2; V1 content lives in typed files |

---

## 3. Goals

**Emotional**
- Make October 9, ADR, LinkedIn, and "Baber" feel like a story only the two of them could have.
- Make the question land as sincere, not performative.

**Practical**
- Give her four reasons to return that do not depend on him writing something new: notes, feelings, day plan, favourites.
- Make the morning email a nudge back to her space, not a newsletter.

**Craft**
- Look like an editorial object, not a Valentine's template. No floating hearts, no pink-on-pink, no cursive body copy.

### Non-goals for V1
- Accounts, cross-device sync, admin dashboard.
- A social feed, chat, or anything that competes with WhatsApp.
- Diagnostic or medical framing in the feelings check-in.
- Manipulative mechanics: no running "No" button, no forced signup, no fake urgency.

---

## 4. Who it is for

**Precious (primary)**
400-level Law student. Loves pink, white and lilies. Lives in her notes. Scrolling and playful humour. Wants to feel known, not marketed to.

Jobs to be done:
- "I want somewhere to put a thought quickly."
- "I want to tell him how I'm feeling without making it a whole conversation."
- "I want to send him my plan for the day like we already do."
- "I want to look at our story and feel something."
- "I want to know what this countdown is about without asking."

**Papi (secondary)**
- Supplies the real content.
- Receives shared plans, check-ins and her answer by email.
- Cannot read her private notes. This is a feature, and the product says so.

---

## 5. Experience narrative

1. She opens the link and meets a passphrase and a lily, not a wall of love.
2. The home page greets her by time of day, shows one daily thing, and offers four useful doors.
3. She reads **Our Story** — five chapters so far, each one a real detail.
4. She uses **My Space** for whatever the day needs.
5. The story ends with: "There's one more page. I'd rather you found it yourself."
6. **The last page**: a short intro, a letter, the question, an honest set of answers, then a date planner.
7. Afterwards the site stays useful. The email keeps a small thread between them.

---

## 6. Features

### P0 — shipped
| Feature | Why it exists |
| --- | --- |
| Passphrase gate | Keeps casual visitors out; sets the tone |
| Home: greeting, date, daily item, quick actions, story preview, countdown, email signup | The daily front door |
| Story timeline + chapter pages | The emotional spine |
| Little Things archive | More notes than fit on the home page |
| Notes (create/edit/delete/search/star/categories/backup) | Her actual habit; the main retention feature |
| Feelings check-in (private or explicit share) | Expression without pressure |
| Day plan (draft, review, send, copy fallback) | An existing ritual, made easier |
| Favourites shelf | Personal value independent of the relationship |
| Countdown | Playful mystery near the footer |
| Progressive reveal + response + date planner | The centrepiece |
| Email subscribe / unsubscribe | The daily thread |
| Daily email dispatcher with idempotency | Keeps the thread alive automatically |
| Preferences: backup, erase, lock | Honest data controls |
| Privacy page | Trust, in plain language |

### P1 — designed for, not built
- Gratitude prompts as a separate surface.
- Reading/watch lists beyond favourites.
- Habit or goal tracking.
- Richer media galleries.

### P2 — V2
- Supabase Auth for her.
- Cloud-synced private notes and favourites.
- Admin dashboard: schedule notes, add memories, see delivery status.
- Shared date planning updates.
- Personalised email preferences (pause, frequency).

---

## 7. Design direction

**Mood:** soft luxury editorial with a playful personal edge. Warm ivory, blush, deep rose, thin hairlines, generous whitespace.

**Palette:** `#FFF9FB` canvas, `#FFFFFF` surface, `#C4658C` rose, `#9C3560` deep rose, `#35232C` ink, `#EFDCE5` hairline. Pink is an accent, not a wash.

**Type:** Cormorant Garamond for display and letter copy; DM Sans for interface, labels and forms. No script fonts in controls.

**Lily:** a custom SVG lily used in the hero arch, dividers, countdown, gate, reveal and email. Always restrained — a signature, not wallpaper.

**Motion:** 0.5–0.9s editorial easing, staggered reveals, gentle card lift, staged reveal transitions. Full `prefers-reduced-motion` support. No autoplay audio.

**No stock romance photography.** Until real photos exist, chapters use a lily plate. A fake photo would be worse than an honest illustration.

---

## 8. Privacy principles

1. **Notes survive the browser.** Notes are stored in Supabase behind the passphrase and cached on device. Feelings, drafts, favourites and her answer stay in IndexedDB. No silent uploads.
2. **Explicit sharing only.** Anything sent to Papi shows the exact text first.
3. **No hidden copies.** Notes live in a service-role-only table; nothing else private exists server-side.
4. **Say what the gate is.** A passphrase is not encryption, and the privacy page says so.
5. **No tracking.** No analytics, pixels or session replay.
6. **Leave cleanly.** Unsubscribe works immediately; local data can be exported or erased.

---

## 9. Success criteria

- Every route works on a 375px screen without horizontal scroll.
- She can complete the whole journey without instructions.
- Story chapters use only real, approved details.
- A note survives a refresh, a browser clear, and a phone switch.
- A private check-in is never transmitted; a shared one always is.
- The countdown is correct in Africa/Lagos and never negative.
- The reveal can be answered honestly in three ways, and all three are handled with dignity.
- Email subscribe, delivery and unsubscribe work end-to-end, with no duplicate morning emails.
- Nothing in the repo or the bundle would embarrass either of them if a friend found the URL.
- The site is still worth opening a month after the question.

---

## 10. Content requirements

**Provided:** ADR connection, LinkedIn reversal, 9 October first meeting, Babe/Baber, open communication and teasing, nightly campus meetups, the arcade plan, countdown dates.

**Still required:**
- First call: date, who called, one remembered line.
- First argument: what happened, how they repaired it, consent to publish.
- First video: the clip, a poster frame.
- The arcade date: after it happens.
- Photos of them, if she is comfortable with them on the site.
- The final letter, rewritten in his voice.
- Her email address, his notification email, the real passphrase.

**Rule:** no invented dates, dialogue, locations or memories. Drafts stay hidden until they are real.

---

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| She uses it twice and forgets it | Notes, day plan and morning email are independent of new content |
| Local notes lost when she clears Safari | Notes sync to Supabase behind the passphrase; other local data has a backup + erase control |
| Passphrase mistaken for real security | Honest privacy page; no sensitive content in the bundle |
| Email lands in spam | Verify domain in Resend, test before launch, unsubscribe header |
| Public URL found by someone else | Site-wide passphrase gate, `noindex`, and nothing shameful in content |
| Reveal feels pressured | Free choice, no tricks, respectful copy for every answer |
| Fabricated memories | Draft flags and the content rule above |

---

## 12. Open questions

1. Does she want photos of herself on a site with her name in the URL?
2. Is `babe/pumpkin/sunshine` right, or is there a private nickname that belongs only here?
3. Should the daily email be one line plus a link, or the full note in the email body?
4. When the countdown hits zero, does he want anything to unlock, or is the conversation the point?
5. After V2 auth, should the shared site key be replaced with per-user RLS, and should local check-ins import?
