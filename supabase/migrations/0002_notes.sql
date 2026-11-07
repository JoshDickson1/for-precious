-- For Precious — private notes
-- Notes are stored server-side so clearing Safari can't erase them.
-- The browser never touches this table directly: all reads and writes go through
-- the `notes` Edge Function, which checks the site key.

create table public.notes (
  id uuid primary key,
  title text not null default '',
  body text not null default '',
  category text not null default 'personal'
    check (category in ('personal', 'ideas', 'reminders', 'gratitude', 'remember', 'free')),
  favourite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_updated_at_idx on public.notes (updated_at desc);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

alter table public.notes enable row level security;
-- Intentionally no policies: service role only.
