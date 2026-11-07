import { z } from "npm:zod@3";
import { json, preflight, readJson } from "../_shared/http.ts";
import { adminClient, requireEnv } from "../_shared/supabase.ts";

const category = z.enum(["personal", "ideas", "reminders", "gratitude", "remember", "free"]);

const noteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(200).default(""),
  body: z.string().max(20_000).default(""),
  category: category.default("personal"),
  favourite: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("save"), note: noteSchema }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
]);

function authorised(req: Request): boolean {
  const expected = Deno.env.get("SITE_KEY");
  const provided = req.headers.get("x-site-key") ?? "";
  return Boolean(expected && provided && provided === expected);
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  if (!authorised(req)) {
    return json({ error: "Not authorised." }, 401);
  }

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) {
    return json({ error: "That note doesn't look right." }, 400);
  }

  const client = adminClient();
  const input = parsed.data;

  if (input.action === "list") {
    const { data, error } = await client
      .from("notes")
      .select("id, title, body, category, favourite, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("notes list failed", error.message);
      return json({ error: "Couldn't load your notes." }, 500);
    }

    return json({
      notes: (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        category: row.category,
        favourite: row.favourite,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  }

  if (input.action === "delete") {
    const { error } = await client.from("notes").delete().eq("id", input.id);
    if (error) {
      console.error("notes delete failed", error.message);
      return json({ error: "Couldn't delete that note." }, 500);
    }
    return json({ ok: true });
  }

  const note = input.note;
  const now = new Date().toISOString();

  const { data, error } = await client
    .from("notes")
    .upsert(
      {
        id: note.id,
        title: note.title.trim(),
        body: note.body,
        category: note.category,
        favourite: note.favourite,
        created_at: note.createdAt ?? now,
        updated_at: now,
      },
      { onConflict: "id" },
    )
    .select("id, title, body, category, favourite, created_at, updated_at")
    .single();

  if (error) {
    console.error("notes save failed", error.message);
    return json({ error: "Couldn't save that note." }, 500);
  }

  return json({
    note: {
      id: data.id,
      title: data.title,
      body: data.body,
      category: data.category,
      favourite: data.favourite,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
});
