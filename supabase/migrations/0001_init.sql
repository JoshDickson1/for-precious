-- For Precious — initial schema
-- All tables are service-role only. RLS is enabled with no policies on purpose:
-- the browser uses the anon key to call Edge Functions, never the tables directly.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.email_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text generated always as (lower(btrim(email))) stored,
  status text not null default 'active'
    check (status in ('pending', 'active', 'paused', 'unsubscribed', 'error')),
  timezone text not null default 'Africa/Lagos',
  consent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index email_subscriptions_email_key
  on public.email_subscriptions (email_normalized);

create table public.shared_day_plans (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text unique,
  plan_date date not null,
  tasks text[] not null default '{}',
  commitments text not null default '',
  looking_forward_to text not null default '',
  note_for_papi text not null default '',
  submitted_at timestamptz not null default now(),
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed')),
  email_message_id text,
  delivery_attempts integer not null default 0,
  last_error text
);

create index shared_day_plans_date_idx on public.shared_day_plans (plan_date desc);

create table public.shared_feelings (
  id uuid primary key default gen_random_uuid(),
  feeling text not null,
  intensity smallint not null default 3 check (intensity between 1 and 5),
  reflection text not null default '',
  tags text[] not null default '{}',
  submitted_at timestamptz not null default now(),
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed')),
  email_message_id text,
  last_error text
);

create table public.reveal_answers (
  id uuid primary key default gen_random_uuid(),
  answer text not null check (answer in ('yes', 'no', 'think')),
  activity text,
  custom_activity text,
  preferred_date date,
  note text not null default '',
  submitted_at timestamptz not null default now(),
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed')),
  last_error text
);

create table public.scheduled_emails (
  id uuid primary key default gen_random_uuid(),
  send_on date not null unique,
  subject text not null,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.email_delivery_log (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.email_subscriptions (id) on delete cascade,
  message_type text not null,
  scheduled_for date,
  idempotency_key text not null unique,
  provider_message_id text,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 1
);

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as rl (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
          when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else rl.count + 1
        end,
        window_start = case
          when rl.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else rl.window_start
        end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;

create trigger email_subscriptions_updated_at
  before update on public.email_subscriptions
  for each row execute function public.set_updated_at();

create trigger email_delivery_log_updated_at
  before update on public.email_delivery_log
  for each row execute function public.set_updated_at();

alter table public.email_subscriptions enable row level security;
alter table public.shared_day_plans enable row level security;
alter table public.shared_feelings enable row level security;
alter table public.reveal_answers enable row level security;
alter table public.scheduled_emails enable row level security;
alter table public.email_delivery_log enable row level security;
alter table public.rate_limits enable row level security;

insert into public.scheduled_emails (send_on, subject, body)
values (
  '2026-12-21',
  'Today is the day the countdown ends',
  'You never asked what the countdown was counting. Today you get to find out in person. Bring the attitude.'
)
on conflict (send_on) do nothing;
