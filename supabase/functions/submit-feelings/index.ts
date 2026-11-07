import { z } from "npm:zod@3";
import { clientIp, json, preflight, readJson } from "../_shared/http.ts";
import { sendEmail } from "../_shared/email.ts";
import { adminClient, requireEnv, withinRateLimit } from "../_shared/supabase.ts";

const schema = z.object({
  feeling: z.string().trim().min(2).max(40),
  intensity: z.number().int().min(1).max(5),
  reflection: z.string().trim().max(3000).default(""),
  tags: z.array(z.string().trim().max(40)).max(5).default([]),
  shared: z.literal(true),
});

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://forprecious.love";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) {
    return json({ error: "That check-in didn't look complete." }, 400);
  }

  const client = adminClient();
  if (!(await withinRateLimit(client, `feelings:${clientIp(req)}`, 20, 3600))) {
    return json({ error: "Too many submissions. Give it a minute." }, 429);
  }

  const input = parsed.data;
  const recipient = requireEnv("CREATOR_NOTIFICATION_EMAIL");

  const { data: row, error } = await client
    .from("shared_feelings")
    .insert({
      feeling: input.feeling,
      intensity: input.intensity,
      reflection: input.reflection,
      tags: input.tags,
    })
    .select("id")
    .single();

  if (error) {
    console.error("feelings insert failed", error.message);
    return json({ error: "Couldn't save that check-in." }, 500);
  }

  const paragraphs = [
    `Feeling: ${input.feeling} (${input.intensity}/5)`,
    input.reflection ? input.reflection : "She didn't write anything else.",
    input.tags.length ? `Tags: ${input.tags.join(", ")}` : "",
  ].filter(Boolean);

  try {
    const { id } = await sendEmail({
      to: recipient,
      subject: `Precious checked in: ${input.feeling}`,
      content: {
        preview: "She chose to share how she's feeling.",
        eyebrow: "Check-in",
        heading: "She sent you a check-in.",
        paragraphs,
        cta: { label: "Open the site", url: SITE_URL },
        footer: "She chose to share this from her My Space page.",
      },
    });

    await client
      .from("shared_feelings")
      .update({ notification_status: "sent", email_message_id: id })
      .eq("id", row.id);

    return json({ status: "sent" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("feelings email failed", message);

    await client
      .from("shared_feelings")
      .update({ notification_status: "failed", last_error: message.slice(0, 500) })
      .eq("id", row.id);

    return json({ error: "The email side isn't working right now. Copy it and send it to him directly." }, 502);
  }
});
