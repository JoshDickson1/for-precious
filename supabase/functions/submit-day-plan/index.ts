import { z } from "npm:zod@3";
import { clientIp, json, preflight, readJson } from "../_shared/http.ts";
import { sendEmail } from "../_shared/email.ts";
import { adminClient, requireEnv, withinRateLimit } from "../_shared/supabase.ts";

const schema = z.object({
  planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tasks: z.array(z.string().trim().max(300)).max(25),
  commitments: z.string().trim().max(1000).default(""),
  lookingForwardTo: z.string().trim().max(1000).default(""),
  noteForPapi: z.string().trim().max(2000).default(""),
  shared: z.literal(true),
  idempotencyKey: z.string().trim().min(8).max(120),
});

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://forprecious.love";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) {
    return json({ error: "That plan didn't look complete." }, 400);
  }

  const client = adminClient();
  if (!(await withinRateLimit(client, `plan:${clientIp(req)}`, 20, 3600))) {
    return json({ error: "Too many submissions. Give it a minute." }, 429);
  }

  const input = parsed.data;
  const recipient = requireEnv("CREATOR_NOTIFICATION_EMAIL");

  const { data: existing, error: existingError } = await client
    .from("shared_day_plans")
    .select("id, notification_status")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();

  if (existingError) {
    console.error("plan lookup failed", existingError.message);
    return json({ error: "Couldn't check that plan." }, 500);
  }

  if (existing?.notification_status === "sent") {
    return json({ status: "sent", duplicate: true });
  }

  let planId = existing?.id;

  if (!planId) {
    const { data, error } = await client
      .from("shared_day_plans")
      .insert({
        idempotency_key: input.idempotencyKey,
        plan_date: input.planDate,
        tasks: input.tasks,
        commitments: input.commitments,
        looking_forward_to: input.lookingForwardTo,
        note_for_papi: input.noteForPapi,
      })
      .select("id")
      .single();

    if (error) {
      console.error("plan insert failed", error.message);
      return json({ error: "Couldn't save that plan." }, 500);
    }
    planId = data.id;
  }

  const paragraphs = [
    `Date: ${input.planDate}`,
    ...input.tasks.map((task) => `• ${task}`),
    input.commitments ? `Commitments: ${input.commitments}` : "",
    input.lookingForwardTo ? `Looking forward to: ${input.lookingForwardTo}` : "",
    input.noteForPapi ? `From her: ${input.noteForPapi}` : "",
  ].filter(Boolean);

  try {
    const { id } = await sendEmail({
      to: recipient,
      subject: `Precious sent her plan for ${input.planDate}`,
      content: {
        preview: "She planned her day and sent it to you.",
        eyebrow: "Day plan",
        heading: "She sent her day.",
        paragraphs,
        cta: { label: "Open the site", url: SITE_URL },
        footer: "She chose to share this from her My Space page.",
      },
    });

    await client
      .from("shared_day_plans")
      .update({
        notification_status: "sent",
        email_message_id: id,
        delivery_attempts: (existing ? 1 : 0) + 1,
        last_error: null,
      })
      .eq("id", planId);

    return json({ status: "sent" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("plan email failed", message);

    await client
      .from("shared_day_plans")
      .update({
        notification_status: "failed",
        delivery_attempts: (existing ? 1 : 0) + 1,
        last_error: message.slice(0, 500),
      })
      .eq("id", planId);

    return json({ error: "The email side isn't working right now. Copy it and send it to him directly." }, 502);
  }
});
