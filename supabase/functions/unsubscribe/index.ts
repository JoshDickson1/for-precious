import { z } from "npm:zod@3";
import { clientIp, json, preflight, readJson } from "../_shared/http.ts";
import { adminClient, withinRateLimit } from "../_shared/supabase.ts";

const schema = z.object({
  token: z.string().uuid(),
});

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) {
    return json({ error: "That link isn't valid." }, 400);
  }

  const client = adminClient();
  if (!(await withinRateLimit(client, `unsubscribe:${clientIp(req)}`, 20, 3600))) {
    return json({ error: "Too many attempts. Try again later." }, 429);
  }

  const { error } = await client
    .from("email_subscriptions")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", parsed.data.token);

  if (error) {
    console.error("unsubscribe failed", error.message);
    return json({ error: "Couldn't stop those emails. Try again." }, 500);
  }

  return json({ status: "unsubscribed" });
});
