import { z } from "npm:zod@3";
import { clientIp, json, preflight, readJson } from "../_shared/http.ts";
import { sendEmail } from "../_shared/email.ts";
import { adminClient, requireEnv, withinRateLimit } from "../_shared/supabase.ts";

const schema = z.object({
  answer: z.enum(["yes", "no", "think"]),
  activity: z.string().trim().max(40).optional(),
  customActivity: z.string().trim().max(200).optional(),
  preferredDate: z.string().trim().max(10).optional(),
  note: z.string().trim().max(2000).optional(),
});

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://forprecious.love";

const headlines: Record<string, string> = {
  yes: "She said yes.",
  think: "She needs a minute.",
  no: "She said no.",
};

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) {
    return json({ error: "That answer didn't look right." }, 400);
  }

  const client = adminClient();
  if (!(await withinRateLimit(client, `answer:${clientIp(req)}`, 10, 3600))) {
    return json({ error: "Too many attempts. Give it a minute." }, 429);
  }

  const input = parsed.data;
  const recipient = requireEnv("CREATOR_NOTIFICATION_EMAIL");

  const { data: row, error } = await client
    .from("reveal_answers")
    .insert({
      answer: input.answer,
      activity: input.activity ?? null,
      custom_activity: input.customActivity ?? null,
      preferred_date: input.preferredDate || null,
      note: input.note ?? "",
    })
    .select("id")
    .single();

  if (error) {
    console.error("answer insert failed", error.message);
    return json({ error: "Couldn't save that answer." }, 500);
  }

  const paragraphs = [
    input.answer === "yes"
      ? "She read the whole thing and said yes. Officially."
      : input.answer === "think"
        ? "She read it all and asked for time. Respect that."
        : "She read it all and said no. Be kind about it.",
    input.answer === "yes" && input.activity ? `Chosen activity: ${input.customActivity || input.activity}` : "",
    input.preferredDate ? `Preferred date: ${input.preferredDate}` : "",
    input.note ? `From her: ${input.note}` : "",
  ].filter(Boolean);

  try {
    const { id } = await sendEmail({
      to: recipient,
      subject: input.answer === "yes" ? "Precious said yes" : "Precious answered the question",
      content: {
        preview: "Her answer to the last page.",
        eyebrow: "The last page",
        heading: headlines[input.answer],
        paragraphs,
        cta: { label: "Open the site", url: SITE_URL },
        footer: "She sent this from the last page of the site.",
      },
    });

    await client
      .from("reveal_answers")
      .update({ notification_status: "sent" })
      .eq("id", row.id);

    return json({ status: "sent", messageId: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("answer email failed", message);

    await client
      .from("reveal_answers")
      .update({ notification_status: "failed", last_error: message.slice(0, 500) })
      .eq("id", row.id);

    return json({ error: "The email side isn't working right now. Copy it and send it to him directly." }, 502);
  }
});
