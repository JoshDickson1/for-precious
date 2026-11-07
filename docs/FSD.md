# For Precious — Functional Specification

**Version:** 1.0 (matches the current codebase)
**Companion:** `docs/PRD.md`

---

## 1. Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript (strict), Vite 6 |
| Styling | Tailwind CSS 3.4, custom tokens, shadcn-style primitives |
| Motion | `motion` (Framer Motion) with reduced-motion guards |
| Routing | React Router 7, lazy-loaded secondary routes |
| Icons | Lucide |
| Local data | IndexedDB via `idb` (cache + local-only features) |
| Private notes | Supabase `notes` table, accessed through the `notes` Edge Function |
| Server | Supabase Postgres + Edge Functions (Deno) |
| Email | Resend HTTP API |
| Validation | Zod on the server; native constraints in the client |
| Hosting | Vercel static + SPA rewrite; Supabase functions |

No state library. Server state is request/response only; local state is React + IndexedDB. Notes are remote-first with an IndexedDB cache and a `pendingSync` queue for offline edits.

---

## 2. Routes

| Route | Component | Layout | Notes |
| --- | --- | --- | --- |
| `/` | Home | Shell | Greeting, daily item, actions, story preview, countdown, email |
| `/our-story` | Story | Shell | 5 published chapters + closing gateway |
| `/our-story/:slug` | Memory | Shell | Detail, media, prev/next; unknown slug → 404 |
| `/little-things` | LittleThings | Shell | Filterable archive |
| `/my-space` | MySpace | Shell | Hub with live counts |
| `/my-space/notes` | Notes | Shell | Supabase CRUD, cached locally |
| `/my-space/feelings` | Feelings | Shell | Private or explicit share |
| `/my-space/day-plan` | DayPlan | Shell | Draft, review, send |
| `/my-space/favourites` | Favourites | Shell | IndexedDB shelf |
| `/our-question` | Question | Standalone | Full-screen reveal, no app nav |
| `/preferences` | Preferences | Shell | Email, backup, erase, lock |
| `/privacy` | Privacy | Shell | Plain-language model |
| `/unsubscribe` | Unsubscribe | Shell | Token from email query |
| `*` | NotFound | Shell | Lily 404 |

Unknown paths inside the reveal (`/our-question/anything`) are not routed. Keep the reveal URL stable.

---

## 3. Access gate

- `VITE_GATE_HASH` = hex SHA-256 of the lowercased, trimmed passphrase.
- If the variable is absent or not 64 chars, the gate **fails closed**: a setup screen is shown and the router never mounts. There is no open development fallback.
- Successful entry stores an expiry and a derived notes key in `sessionStorage` for 8 hours.
- Gate is checked once in `App` before the router mounts; `lock()` clears both and reloads. `/unsubscribe` is the only bypass.
- Failure copy is deliberately soft ("Not quite. Try the word I gave you."), with an optional hint from `site.gate.hint`.
- The notes key is `sha256(lower(trim(passphrase)) + ":for-precious-notes")`. The browser derives it on unlock; the server stores the same value as `SITE_KEY`. It is never bundled.
- **Threat model:** deters casual access only. Story content is in the bundle. Never store private data in `src/content`.

---

## 4. Content model

All content is typed and imported at build time.

```ts
Memory {
  slug, title, eyebrow, date: string | null,
  datePrecision: "exact" | "month" | "unknown",
  summary, body: string[], category, order, published,
  cover?, media: MediaItem[]
}

DailyItem { id, type: "note"|"affirmation"|"prompt"|"discovery", body, scheduledFor? }

RevealResponse {
  answer: "yes"|"think"|"no",
  activity?, customActivity?, preferredDate?, note?, createdAt
}
```

Rules:
- Only `published: true` memories render anywhere.
- `datePrecision: "unknown"` shows the category label instead of a date. Never fabricate one.
- `MediaItem.src` is an ImageKit (or other HTTPS) URL. Missing media renders the lily plate.
- Daily selection: scheduled item for the local day wins; otherwise `hash(dayKey) % pool.length`, so a refresh cannot change the day's item.

---

## 5. Local storage

Database `for-precious`, version 1.

| Store | Key | Indexes |
| --- | --- | --- |
| `notes` | id | `by-updated` |
| `feelings` | id | `by-created` |
| `plans` | id | `by-date` |
| `favourites` | id | `by-created` |
| `meta` | key | — (`reveal-response` lives here) |

API (`src/lib/storage.ts`): `listNotes`, `saveNote` (upsert), `cacheNotes`, `markNoteSynced`, `deleteNote`, `listFeelings`, `saveFeeling`, `deleteFeeling`, `listPlans`, `savePlan`, `listFavourites`, `saveFavourite`, `deleteFavourite`, `getMeta/setMeta`, `getRevealResponse/setRevealResponse`, `exportLocalData`, `clearLocalData`.

Notes API (`src/lib/backend.ts`): `fetchNotes`, `saveRemoteNote`, `deleteRemoteNote`, gated by `notesConfigured`. The `notes` function checks `x-site-key` against the `SITE_KEY` secret and uses the service role. A failed save is written to IndexedDB with `pendingSync: true` and retried on the next successful load.

Failure handling: `StorageUnavailableError` is thrown when IndexedDB is blocked (private windows, lockdown mode). Every page catches it and shows a plain-language dead end rather than a silent failure. If Supabase is unreachable, Notes falls back to the device cache and says so.

Export JSON shape: `{ exportedAt, notes[], feelings[], plans[], favourites[] }`.

---

## 6. Screen behaviour

### 6.1 Home
- Greeting recomputed every 30s from `Africa/Lagos`.
- Daily item is deterministic per day.
- Quick actions: Notes, Feelings, Day plan, Favourites.
- Story preview: first 3 published memories.
- Countdown: computed from `site.countdown.targetAt`, updates each second, clamps at zero, shows a completion line that still hides the meaning.
- Email signup: calls `subscribe`; renders a backend-off notice when env is missing.

### 6.2 Story
- Vertical list with chapter number, date or category, title, summary, plate.
- Closing card links to `/our-question` with low-pressure copy. This is discovery, not a modal trap.

### 6.3 Memory
- 404 component for unpublished or unknown slugs.
- First paragraph gets a drop cap.
- Media: images lazy-load; videos use controls, metadata preload, no autoplay.
- Prev/next navigation; on the final chapter the "next" card points to the reveal.

### 6.4 Notes
- Create, edit, delete, search (title + body), filter by category, star, export.
- Two-step delete (first tap arms, second confirms within 3s) to avoid a native confirm.
- Empty states differ for "no notes" vs "no matches".
- Saving with empty title and body is rejected.
- All data local. Copy states this explicitly.

### 6.5 Feelings
- 11 feelings; intensity 1–5; optional reflection; up to 5 tags.
- Two actions: "Keep it to myself" (default) and "Send to Papi".
- Sending always opens a review screen showing the exact payload.
- Confirm → `submit-feelings`. Success saves a local copy marked `shared: true`.
- Failure → fallback screen with the message, a copy button and a WhatsApp share link. The failure is never presented as success.
- History lists entries with private/shared state and delete.

### 6.6 Day plan
- Date defaults to the local day; tasks are a dynamic list (≥1); optional commitments, anticipation, note.
- "Review & send" builds a stable `id` (used as `idempotencyKey`) and shows the exact email body.
- Confirm → `submit-day-plan`; on success the local plan is stored `submitted: true`.
- On failure the plan is still saved locally and the copy fallback is shown.
- "Save a draft" stores `submitted: false` and never sends.

### 6.7 Favourites
- 8 kinds; title required; optional note and link.
- Filter chips only for kinds that have items.
- Two-step delete. Local only.

### 6.8 Reveal
State machine: `intro → why → letter → question → (answer | plan) → done`, plus `responded` on revisit.

- Progress hairline for the first four steps only.
- The letter is a paper card with the creator's copy from `src/content/reveal.ts`.
- Answer choices: Yes / Give me a minute / I need to say no. No tricks, no disabled No.
- Yes → date planner (5 options + custom + date + note) → "Lock it in" → local save → send step.
- Send step calls `submit-answer`; on failure shows copy, never a fake success.
- `think` and `no` show respectful copy and no further prompting.
- If a response exists locally, revisiting shows a summary with "Read it again" rather than resetting the experience.
- The reveal is not authenticated; access is by URL. Story order is a narrative choice, not a security boundary.

### 6.9 Preferences
- Email signup (shares `EmailSignup` with Home).
- Live local counts, JSON backup, two-step erase.
- "Lock this device" clears the gate session and reloads.
- Copy is explicit that local data does not sync.

### 6.10 Unsubscribe
- Requires `?token=<uuid>`.
- Confirm → `unsubscribe`; success shows a clean confirmation.
- Missing token explains where to find the link. No email address is ever put in a URL.

---

## 7. API contracts

All functions: `POST`, JSON, CORS preflight supported, no JWT verification (`verify_jwt = false`), rate-limited, and validated with Zod. Never trust client `shared: true` alone — the server stores only what the schema allows and treats every write as an intentional share.

### `subscribe`
```json
{ "email": "her@example.com", "timezone": "Africa/Lagos", "consent": true }
→ { "status": "active", "delivered": true }
```
- Rate limit: 5/hour/IP.
- If `ALLOWED_SUBSCRIBER_EMAIL` is set, other addresses are rejected.
- Upsert by normalised email; re-subscribe clears `unsubscribed_at`.
- Sends a welcome email. Email failure does not roll back the subscription; it is logged.

### `unsubscribe`
```json
{ "token": "uuid" } → { "status": "unsubscribed" }
```
- 20/hour/IP. Idempotent. Does not reveal whether the token existed.

### `submit-day-plan`
```json
{
  "planDate": "2026-10-24",
  "tasks": ["..."], "commitments": "...", "lookingForwardTo": "...",
  "noteForPapi": "...", "shared": true, "idempotencyKey": "uuid"
}
→ { "status": "sent" }
```
- 20/hour/IP.
- Duplicate `idempotencyKey` with status `sent` returns `{ duplicate: true }` and sends no second email.
- Email failure: row marked `failed`, `502` returned with a human message → client shows copy fallback.

### `submit-feelings`
```json
{ "feeling": "loved", "intensity": 4, "reflection": "...", "tags": ["us"], "shared": true }
→ { "status": "sent" }
```

### `submit-answer`
```json
{ "answer": "yes", "activity": "arcade", "preferredDate": "2026-11-01", "note": "..." }
→ { "status": "sent" }
```
- 10/hour/IP. Emails the creator with the answer and chosen plan.

### `dispatch-daily-email`
Header: `x-scheduler-secret: <EMAIL_SCHEDULER_SECRET>`. No secret configured → `401`.
```json
→ { "processed": 1, "sent": 1, "skipped": 0, "failed": 0 }
```
- Only `status = 'active'` subscriptions.
- Sends only when the subscriber's local hour equals `DAILY_EMAIL_HOUR` (default 7).
- Unique key `${subscription_id}:daily:${localDate}` in `email_delivery_log` prevents duplicates across cron retries.
- A `scheduled_emails` row for the date overrides the rotating prompt.
- Failures are logged and summarised in an email to the creator.

---

## 8. Database

`0001_init.sql` creates:

| Table | Purpose |
| --- | --- |
| `email_subscriptions` | Address, status, timezone, consent, unsubscribe token |
| `shared_day_plans` | Explicitly submitted plans + delivery status |
| `shared_feelings` | Explicitly shared check-ins + delivery status |
| `reveal_answers` | Her answer + chosen date + delivery status |
| `scheduled_emails` | Date-specific override content |
| `email_delivery_log` | Idempotency + provider message IDs |
| `rate_limits` | DB-backed limiter (survives cold starts) |

- RLS enabled on every table with **no policies**. Only the service role (Edge Functions) can read or write.
- `consume_rate_limit(key, limit, window)` is `SECURITY DEFINER`, executable by service role only.
- No private journal content is ever written to these tables.

---

## 9. Email

Templates are built in `supabase/functions/_shared/email.ts` with table-based HTML and inline styles. Plain-text alternative included.

| Type | Trigger | Contains |
| --- | --- | --- |
| Welcome | `subscribe` | Confirmation + site CTA + unsubscribe |
| Daily | cron | Greeting, prompt or scheduled note, site CTA, day-plan link, unsubscribe |
| Day plan | `submit-day-plan` | Date, tasks, commitments, anticipation, note |
| Feelings | `submit-feelings` | Feeling, intensity, reflection, tags |
| Answer | `submit-answer` | Answer, activity, date, note |
| Dispatcher failure | cron | Counts + pointer to logs |

Every message includes `List-Unsubscribe` and `List-Unsubscribe-Post: One-Click` when a token exists. No sensitive journal content is logged in `last_error`; provider errors are truncated to 500 chars.

---

## 10. Error, empty and loading states

| Surface | Empty | Error | Loading |
| --- | --- | --- | --- |
| Notes | Write-first CTA | Storage blocked copy | "Opening your notebook…" |
| Feelings | Prompt for first check-in | Inline error, data preserved | Button label change |
| Day plan | No-plans card | Copy fallback; draft saved | "Sending…" |
| Favourites | Add-first CTA | Storage blocked copy | "Opening the shelf…" |
| Story | — (content is static) | — | — |
| Email | — | Human message, form retained | "Adding you…" |
| Reveal | — | Copy fallback, never fake success | "Sending…" |

No `alert()` or `confirm()` in production paths. Two-step inline confirmations are used for destructive actions.

---

## 11. Accessibility & performance

- Semantic landmarks (`header`, `main`, `nav`, `footer`), skip link, one `h1` per page.
- Focus rings visible on all interactive elements (`:focus-visible`).
- Inputs have labels; errors use `aria-invalid` + `aria-describedby` where relevant.
- Touch targets ≥ 44px for primary actions; mobile bottom nav respects safe-area insets.
- `prefers-reduced-motion` disables animation and smooth scrolling globally.
- Colour contrast targets WCAG AA; primary buttons use deep rose on white, not soft pink.
- Images: explicit aspect boxes, lazy loading, alt text required in the type.
- Route-level code splitting for Memory, Notes, Feelings, DayPlan, Favourites, Question. Supabase JS is dynamically imported only when a submission is made.
- Fonts: two families, preconnected, `display=swap`.

---

## 12. Configuration

Client: `VITE_SITE_URL`, `VITE_GATE_HASH`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
Server: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `CREATOR_NOTIFICATION_EMAIL`, `SITE_URL`, `ALLOWED_SUBSCRIBER_EMAIL`, `EMAIL_SCHEDULER_SECRET`, `DAILY_EMAIL_HOUR`.

Secrets never use the `VITE_` prefix. The anon key is safe to expose; the service role key is not.

---

## 13. Acceptance criteria

**Story**
- Only published memories appear; unknown slugs render 404.
- No date is shown for `unknown` precision.
- Chapter order is stable and prev/next works at both ends.

**Notes**
- Create → refresh → still there.
- Search matches title and body.
- Delete requires two taps; export downloads valid JSON.
- No network request is made by any note action.

**Feelings**
- Private save performs no network request (verify in DevTools).
- Share shows the exact payload before sending.
- Offline/not-configured yields the copy fallback, not a success state.

**Day plan**
- Drafts never hit the network.
- Re-sending the same plan does not duplicate the email.
- Failure keeps the plan locally.

**Countdown**
- Matches `countdownTo` unit tests; never negative; completion state hides the meaning.

**Reveal**
- All three answers reachable without tricks.
- Yes leads to date selection, then a send/copy step.
- Revisit shows the saved answer; "Read it again" works.

**Email**
- Welcome, daily, and unsubscribe work against the real domain.
- Cron cannot double-send.
- Unsubscribed addresses are excluded immediately.

**Privacy**
- Clearing IndexedDB removes the local copy only; synced notes remain in the private space.
- Supabase contains notes but no feelings, favourites or drafts.
- The privacy page matches actual behaviour.

---

## 14. Build order (for future changes)

1. Content and copy first, then layout.
2. Local tools (storage → UI → states).
3. Story/reveal narrative.
4. Backend functions + validation + rate limits.
5. Email templates + scheduler.
6. Media.
7. Typecheck, tests, build, mobile pass.
8. Deploy, DNS, Resend verification, live smoke test.

Do not ship a button that does nothing. Do not ship a "success" state that was not confirmed by the server.
