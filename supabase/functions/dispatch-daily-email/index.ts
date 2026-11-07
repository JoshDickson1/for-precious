import { json, preflight } from "../_shared/http.ts";
import { sendEmail } from "../_shared/email.ts";
import { adminClient, requireEnv } from "../_shared/supabase.ts";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://forprecious.love";
const SEND_HOUR = Number(Deno.env.get("DAILY_EMAIL_HOUR") ?? "7");

const prompts = [
  "What's one small thing that made yesterday easier?",
  "What are you carrying today that you could put down for an hour?",
  "Who made you laugh this week?",
  "What's one thing you're looking forward to?",
  "What would make today 10% gentler?",
  "What did you do recently that nobody noticed?",
  "What's something you want to remember about this month?",
  "What's a small thing you're proud of?",
  "What's on your mind that hasn't been said out loud?",
  "What do you want more of this week?",
];

function localDateAndHour(timeZone: string, now: Date): { date: string; hour: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const expected = Deno.env.get("EMAIL_SCHEDULER_SECRET");
  const provided = req.headers.get("x-scheduler-secret") ?? "";
  if (!expected || provided !== expected) {
    return json({ error: "Not authorised." }, 401);
  }

  const client = adminClient();
  const creator = requireEnv("CREATOR_NOTIFICATION_EMAIL");
  const now = new Date();

  const { data: subscribers, error } = await client
    .from("email_subscriptions")
    .select("id, email, timezone, unsubscribe_token")
    .eq("status", "active");

  if (error) {
    console.error("subscriber lookup failed", error.message);
    return json({ error: "Could not load subscribers." }, 500);
  }

  const summary = { processed: 0, sent: 0, skipped: 0, failed: 0 };

  for (const subscriber of subscribers ?? []) {
    summary.processed += 1;

    const { date, hour } = localDateAndHour(subscriber.timezone || "Africa/Lagos", now);
    if (hour !== SEND_HOUR) {
      summary.skipped += 1;
      continue;
    }

    const idempotencyKey = `${subscriber.id}:daily:${date}`;

    const { data: existing } = await client
      .from("email_delivery_log")
      .select("id, status")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing?.status === "sent") {
      summary.skipped += 1;
      continue;
    }

    let logId = existing?.id;

    if (!logId) {
      const { data: inserted, error: insertError } = await client
        .from("email_delivery_log")
        .insert({
          subscription_id: subscriber.id,
          message_type: "daily",
          scheduled_for: date,
          idempotency_key: idempotencyKey,
        })
        .select("id")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          summary.skipped += 1;
          continue;
        }
        console.error("delivery log insert failed", insertError.message);
        summary.failed += 1;
        continue;
      }
      logId = inserted.id;
    }

    const { data: scheduled } = await client
      .from("scheduled_emails")
      .select("subject, body")
      .eq("send_on", date)
      .eq("active", true)
      .maybeSingle();

    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    try {
      const { id } = await sendEmail({
        to: subscriber.email,
        subject: scheduled?.subject ?? "A small thing for today",
        content: {
          preview: scheduled ? scheduled.body : "Today's little thing is waiting, sunshine.",
          eyebrow: "Morning",
          heading: scheduled ? scheduled.subject : "Morning, sunshine.",
          paragraphs: [
            scheduled
              ? scheduled.body
              : "Today's little thing is on the site. So is the countdown you keep pretending not to be curious about.",
            prompt ? `While you're there: ${prompt}` : "",
          ].filter(Boolean),
          cta: { label: "Come see today's little thing", url: SITE_URL },
          secondary: {
            label: "Send Papi your plan for the day",
            url: `${SITE_URL}/my-space/day-plan`,
          },
          footer: "One short note in the morning. That's the whole deal.",
          unsubscribeUrl: `${SITE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`,
        },
      });

      await client
        .from("email_delivery_log")
        .update({
          status: "sent",
          provider_message_id: id,
          attempt_count: (existing ? 1 : 0) + 1,
          last_error: null,
        })
        .eq("id", logId);

      summary.sent += 1;
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Unknown email error";
      console.error("daily email failed", message);

      await client
        .from("email_delivery_log")
        .update({
          status: "failed",
          attempt_count: (existing ? 1 : 0) + 1,
          last_error: message.slice(0, 500),
        })
        .eq("id", logId);

      summary.failed += 1;
    }
  }

  if (summary.failed > 0) {
    try {
      await sendEmail({
        to: creator,
        subject: "Some daily emails failed",
        content: {
          preview: "The daily dispatcher had failures.",
          eyebrow: "Dispatcher",
          heading: "Some morning emails didn't go out.",
          paragraphs: [
            `Processed: ${summary.processed}`,
            `Sent: ${summary.sent}`,
            `Skipped: ${summary.skipped}`,
            `Failed: ${summary.failed}`,
            "Check the email_delivery_log table for the error messages.",
          ],
          cta: { label: "Open Supabase", url: "https://supabase.com/dashboard" },
          footer: "Automated message from For Precious.",
        },
      });
    } catch (error) {
      console.error("failure alert email failed", error instanceof Error ? error.message : error);
    }
  }

  return json(summary);
});
