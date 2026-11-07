# For Precious

A private little world for Precious — a five-chapter story, a daily note, a private notebook, a feelings check-in, a day-plan ritual, a countdown nobody explains, and one last page she has to find herself.

Built with React 19, TypeScript, Vite, Tailwind, Motion, Supabase and Resend.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. The local passphrase is **precious** (set in `.env.local`).

```bash
npm run typecheck
npm run test
npm run build
```

## The passphrase

`VITE_GATE_HASH` is a SHA-256 hash of the passphrase. **If it is missing, the site fails closed** — visitors see a "this door needs a key" screen instead of the site. That is deliberate: a forgotten environment variable must not publish her name and your memories.

```bash
node -e "console.log(require('crypto').createHash('sha256').update('your phrase').digest('hex'))"
```

Put the hash in `.env.local` and in Vercel's environment variables. Change it before she sees the site.

**Be honest about what this is:** a door, not a vault. The story, letter and countdown are part of the JavaScript bundle, so someone determined could read them without the passphrase. Notes are stored server-side; their API key is derived from the passphrase and kept only in the unlocked session, not bundled. It is still a shared key, not real auth. Nothing sensitive should live in `src/content`.

## Where everything lives

| You want to change… | Edit this |
| --- | --- |
| Her name, nicknames, countdown dates, timezone | `src/config/site.ts` |
| Timeline chapters, dates, photos | `src/content/memories.ts` |
| Daily notes, affirmations, prompts | `src/content/daily.ts` |
| The letter, the question, the date options | `src/content/reveal.ts` |
| Colours, fonts, spacing | `tailwind.config.ts` + `src/index.css` |
| Nav and footer | `src/components/layout/Shell.tsx` |

### Adding a photo or video to a chapter

Upload to ImageKit, then add a media item:

```ts
{
  slug: "when-we-met-for-real",
  // …
  cover: { type: "image", src: "https://ik.imagekit.io/you/oct-9.jpg", alt: "Precious on the day we met" },
  media: [
    { type: "image", src: "https://ik.imagekit.io/you/oct-9.jpg", alt: "Us, October 9", caption: "The first one." },
  ],
}
```

Media renders only when present. Nothing invents a photo that doesn't exist.

## Content still needed before launch

The story currently publishes five chapters (ADR, LinkedIn, 9 October, Babe/Baber, the way we are). Four are drafted but hidden:

- `our-first-call`
- `our-first-argument`
- `our-first-video`
- `the-arcade`

Set `published: true` only when the real details and media are in. **Do not invent memories.** Also missing: the final letter (a draft is in place — rewrite it in your own voice), your notification email, her email address, and a real passphrase.

## Backend setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run every file in `supabase/migrations/` in order in the SQL editor (or `supabase db push`).
3. Copy the project URL and **anon** key into `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Put the **service role** key in the Edge Function secrets (step 2).
5. Set `SITE_KEY` in the function secrets to the notes key derived from the passphrase (command below). It is never sent to the browser build. Notes fail closed without it:

```bash
node -e "const c=require('crypto');console.log(c.createHash('sha256').update(('your phrase').trim().toLowerCase()+':for-precious-notes').digest('hex'))"
```

All tables have RLS enabled with no policies. The browser cannot read or write them directly — only Edge Functions using the service role can. Do not add public policies for journal-style data. Notes are stored in `public.notes`; every read and write goes through the `notes` function, which checks `SITE_KEY`.

### 2. Deploy the functions

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set \
  RESEND_API_KEY=... \
  CREATOR_NOTIFICATION_EMAIL=you@example.com \
  EMAIL_FROM="For Precious <notes@forprecious.love>" \
  SITE_URL=https://forprecious.love \
  ALLOWED_SUBSCRIBER_EMAIL=her@example.com \
  EMAIL_SCHEDULER_SECRET=$(openssl rand -hex 32) \
  SITE_KEY=<derived notes key, see step 1.5> \
  DAILY_EMAIL_HOUR=7
supabase functions deploy
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by Supabase. `SITE_KEY` is the derived notes key the `notes` function checks; the browser derives the same key when she enters the passphrase.

### 3. Resend

1. Add `forprecious.love` as a domain in [Resend](https://resend.com) and add the DNS records it gives you.
2. Wait for verification.
3. Create an API key and set it as `RESEND_API_KEY`.
4. Send yourself a test before launch. A failed Resend call makes the site fall back to "copy it and send it yourself" — it does not pretend to succeed.

Single opt-in is intentional: she types her own address, gets a welcome email, and every email has a working unsubscribe link.

### 4. Daily email scheduler

Resend does not run recurring jobs. The migration `supabase/migrations/0003_cron.sql` schedules an hourly `pg_cron` job that calls `net.http_post`. Enable **pg_cron** and **pg_net** under Database → Extensions, then create two Vault secrets before running the migration:

```sql
select vault.create_secret(
  'https://<PROJECT_REF>.supabase.co/functions/v1/dispatch-daily-email',
  'for_precious_function_url'
);
select vault.create_secret('<EMAIL_SCHEDULER_SECRET>', 'for_precious_scheduler_secret');
```

The job runs hourly and only sends when it is `DAILY_EMAIL_HOUR` in the subscriber's timezone, with a unique delivery key per subscriber per day so a retry can't double-send. One subscriber on the free tier is nowhere near the limits.

## Deploy

1. Push to a **private** GitHub repo.
2. Import into Vercel. Framework preset: Vite. Build: `npm run build`. Output: `dist`.
3. Add `VITE_SITE_URL`, `VITE_GATE_HASH`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in Vercel → Settings → Environment Variables. Missing `VITE_GATE_HASH` locks the site; that is the safe failure.
4. Buy `forprecious.love` (`.mylove` is not a real TLD — `.love` is).
5. Add the domain in Vercel and point DNS at it. HTTPS is automatic.
6. Add the same domain to Resend and publish its DNS records.
7. Test the live URL on her actual phone, not just your laptop.

## Privacy model

| Data | Where it lives | Can Papi see it? |
| --- | --- | --- |
| Notes | Supabase `notes` table (service-role only) + device cache | Only by reading the database; not shown anywhere |
| Check-ins, plans, favourites | Her browser (IndexedDB) | No |
| Unsent drafts | Her browser | No |
| Shared day plans / check-ins / answer | Supabase + email | Yes, explicitly sent |
| Email address | Supabase | Used for delivery only |
| Published story, letter, countdown | The site bundle | Yes (it's the site) |

The Privacy page in the app says all of this in plain language. Keep it true if you change the architecture.

## Known limits (be honest with yourself)

- The passphrase is a soft gate, not encryption. The notes key is derived from it and lives in the unlocked session; the story and letter are still readable in the bundle.
- Notes sync, but check-ins, plans and favourites still live on one device. There is a JSON backup in Preferences.
- There is no admin dashboard yet. Content edits happen in `src/content` and require a redeploy.
- No authentication, so the notes function trusts a shared site key rather than a real user session. That is V2.
- Email delivery depends on Resend and DNS being correctly configured.

## V2

Supabase Auth for her account, cloud-synced check-ins, plans and favourites, real per-user RLS instead of a shared site key, an admin dashboard for scheduling notes and adding memories, and a proper `memories` table if content editing starts to hurt.

## Structure

```
src/
  components/   ui, layout, cards, floral, motion
  config/       site identity, countdown, nav
  content/      memories, daily notes, reveal copy
  lib/          date, storage, backend, gate
  pages/        home, story, my space, reveal, preferences
supabase/
  migrations/   schema, notes, RLS, rate limiting, pg_cron job
  functions/    subscribe, unsubscribe, notes, submit-*, dispatch-daily-email
docs/           PRD and FSD
```
