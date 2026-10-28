/**
 * Upserts the curriculum (src/content/curriculum) into the `tasks` table.
 * Idempotent: unchanged tasks are left alone; changed tasks get content_version + 1.
 *
 *   npm run seed:curriculum            # writes to the project in .env.local
 *   npm run seed:curriculum -- --dry   # shows what would change
 */
import { createClient } from "@supabase/supabase-js";
import { flattenCurriculum } from "../src/content/curriculum";
import type { Database } from "../src/lib/supabase/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Insert"];

const dry = process.argv.includes("--dry");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. node --env-file=.env.local).",
  );
  process.exit(1);
}

const db = createClient<Database>(url, secret, { auth: { persistSession: false } });

const CONTENT_FIELDS = [
  "title",
  "why_it_matters",
  "due_day_offset",
  "output_type",
  "form_id",
  "accept",
  "equivalence_key",
  "is_key_output",
  "launch_file_section",
  "support",
  "sort_order",
] as const;

const rows: TaskRow[] = flattenCurriculum().map((t) => ({
  id: t.id,
  pathway_id: t.pathwayId,
  area_id: t.areaId,
  slug: t.slug,
  title: t.title,
  why_it_matters: t.whyItMatters,
  due_day_offset: t.dueDayOffset,
  output_type: t.output.type,
  form_id: t.output.type === "form" ? t.output.formId : null,
  accept: t.output.type === "file" ? [...t.output.accept] : null,
  equivalence_key: t.equivalenceKey ?? null,
  is_key_output: t.isKeyOutput ?? false,
  launch_file_section: t.launchFileSection,
  support: [...(t.support ?? [])],
  sort_order: t.sortOrder,
}));

const { data: existing, error: readError } = await db.from("tasks").select("*");
if (readError) throw readError;
const byId = new Map(existing.map((row) => [row.id, row]));

const changed = (row: TaskRow) => {
  const current = byId.get(row.id);
  if (!current) return true;
  return CONTENT_FIELDS.some(
    (f) => JSON.stringify(current[f] ?? null) !== JSON.stringify(row[f] ?? null),
  );
};

const upserts = rows
  .filter(changed)
  .map((row) => ({ ...row, content_version: (byId.get(row.id)?.content_version ?? 0) + 1 }));
const stale = existing.filter((row) => !rows.some((r) => r.id === row.id)).map((r) => r.id);

console.log(
  `${rows.length} tasks in content · ${upserts.length} new or changed · ${stale.length} no longer in content`,
);
if (stale.length) console.log("Not deleted (completions may reference them):", stale.join(", "));
if (dry || upserts.length === 0) process.exit(0);

const { error } = await db.from("tasks").upsert(upserts, { onConflict: "id" });
if (error) throw error;
console.log(`Upserted ${upserts.length} tasks.`);
