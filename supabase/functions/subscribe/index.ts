import { z } from "npm:zod@3";
import { clientIp, json, preflight, readJson } from "../_shared/http.ts";
import { sendEmail } from "../_shared/email.ts";
import { adminClient, withinRateLimit } from "../_shared/supabase.ts";

const schema = z.object({
  email: z.string().trim().email().max(200),
  timezone: z.string().trim().min(3).max(60),
  consent: z.literal(true),
});

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://forprecious.love";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) {
    return json({ error: "That email doesn't look right." }, 400);
  }

  const client = adminClient();
  const ip = clientIp(req);
  if (!(await withinRateLimit(client, `subscribe:${ip}`, 5, 3600))) {
    return json({ error: "Too many attempts. Try again later." }, 429);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const allowed = Deno.env.get("ALLOWED_SUBSCRIBER_EMAIL")?.trim().toLowerCase();
  if (allowed && email !== allowed) {
    return json({ error: "That address can't be added right now." }, 403);
  }

  const { data: existing, error: lookupError } = await client
    .from("email_subscriptions")
    .select("id, unsubscribe_token")
    .eq("email_normalized", email)
    .maybeSingle();

  if (lookupError) {
    console.error("subscription lookup failed", lookupError.message);
    return json({ error: "Couldn't save that right now." }, 500);
  }

  let token: string;

  if (existing) {
    const { data, error } = await client
      .from("email_subscriptions")
      .update({
        status: "active",
        timezone: parsed.data.timezone,
        consent_at: new Date().toISOString(),
        unsubscribed_at: null,
      })
      .eq("id", existing.id)
      .select("unsubscribe_token")
      .single();
    if (error) {
      console.error("subscription update failed", error.message);
      return json({ error: "Couldn't save that right now." }, 500);
    }
    token = data.unsubscribe_token;
  } else {
    const { data, error } = await client
      .from("email_subscriptions")
      .insert({
        email,
        status: "active",
        timezone: parsed.data.timezone,
        confirmed_at: new Date().toISOString(),
      })
      .select("unsubscribe_token")
      .single();
    if (error) {
      console.error("subscription insert failed", error.message);
      return json({ error: "Couldn't save that right now." }, 500);
    }
    token = data.unsubscribe_token;
  }

  let delivered = false;
  try {
    await sendEmail({
      to: email,
      subject: "You're on the list, sunshine",
      content: {
        preview: "One short note, most mornings. That's the whole deal.",
        eyebrow: "One email, then quiet",
        heading: "You're on the list, sunshine.",
        paragraphs: [
          "From tomorrow morning, one short note lands here — usually before your day gets loud.",
          "It'll always link back to your little world. Nothing else, no clever marketing, no list-sharing.",
          "And if you ever want it to stop, the link is at the bottom of every email. One tap.",
        ],
        cta: { label: "Open your little world", url: SITE_URL },
        secondary: { label: "Plan your day and send it to Papi", url: `${SITE_URL}/my-space/day-plan` },
        footer: "You're getting this because you asked for it.",
        unsubscribeUrl: `${SITE_URL}/unsubscribe?token=${token}`,
      },
    });
    delivered = true;
  } catch (error) {
    console.error("welcome email failed", error instanceof Error ? error.message : error);
  }

  return json({ status: "active", delivered });
});
