-- For Precious — hourly scheduler for the daily email.
--
-- Resend does not run recurring jobs, so Supabase calls the dispatch function
-- once an hour. The function itself decides whether it is 07:00 for each
-- subscriber and refuses to send the same day twice.
--
-- Before running this migration, create two Vault secrets:
--
--   select vault.create_secret(
--     'https://<PROJECT_REF>.supabase.co/functions/v1/dispatch-daily-email',
--     'for_precious_function_url'
--   );
--   select vault.create_secret(
--     '<EMAIL_SCHEDULER_SECRET>',
--     'for_precious_scheduler_secret'
--   );
--
-- If the secrets are missing, this migration does nothing and leaves a notice.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare
  fn_url text;
  scheduler_secret text;
  existing_job bigint;
begin
  if to_regclass('cron.job') is null then
    raise notice 'Skipping scheduler: cron.job not found. Enable pg_cron first.';
    return;
  end if;

  if to_regclass('vault.decrypted_secrets') is null then
    raise notice 'Skipping scheduler: Vault not found. Create the two secrets from the header comment.';
    return;
  end if;

  select decrypted_secret into fn_url
  from vault.decrypted_secrets
  where name = 'for_precious_function_url'
  limit 1;

  select decrypted_secret into scheduler_secret
  from vault.decrypted_secrets
  where name = 'for_precious_scheduler_secret'
  limit 1;

  if fn_url is null or scheduler_secret is null then
    raise notice 'Skipping scheduler: add for_precious_function_url and for_precious_scheduler_secret to Vault.';
    return;
  end if;

  select jobid into existing_job
  from cron.job
  where jobname = 'for-precious-daily'
  limit 1;

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule(
    'for-precious-daily',
    '0 * * * *',
    format(
      $job$select net.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-scheduler-secret', %L
        ),
        body := '{}'::jsonb
      );$job$,
      fn_url,
      scheduler_secret
    )
  );

  raise notice 'Scheduled for-precious-daily (hourly).';
end $$;
