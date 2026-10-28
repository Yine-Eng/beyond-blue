import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKETS = ["task-outputs", "avatars"] as const;

/**
 * Daily (vercel.json): removes uploaded files whose owner no longer exists, e.g. demo users purged
 * after 24 hours by pg_cron. Supabase only allows Storage deletion through its API, so this runs
 * here rather than in SQL. Doubles as a keep-alive for the free-tier database.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const removed: Record<string, number> = {};

  for (const bucket of BUCKETS) {
    removed[bucket] = 0;
    const { data: folders, error } = await admin.storage.from(bucket).list("", { limit: 1000 });
    if (error) throw error;
    const ownerIds = folders.map((f) => f.name).filter((name) => /^[0-9a-f-]{36}$/.test(name));
    if (ownerIds.length === 0) continue;

    const { data: living } = await admin.from("profiles").select("id").in("id", ownerIds);
    const alive = new Set((living ?? []).map((p) => p.id));

    for (const owner of ownerIds.filter((id) => !alive.has(id))) {
      const { data: files } = await admin.storage.from(bucket).list(owner, { limit: 1000 });
      const paths = await collectPaths(admin, bucket, owner, files ?? []);
      if (paths.length) {
        await admin.storage.from(bucket).remove(paths);
        removed[bucket] += paths.length;
      }
    }
  }

  console.log(JSON.stringify({ event: "cron_cleanup", removed }));
  return NextResponse.json({ ok: true, removed });
}

type Listed = { name: string; id: string | null };

/** Storage lists one level at a time; folders have a null id. */
async function collectPaths(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  bucket: string,
  prefix: string,
  entries: Listed[],
): Promise<string[]> {
  const paths: string[] = [];
  for (const entry of entries) {
    const path = `${prefix}/${entry.name}`;
    if (entry.id) paths.push(path);
    else {
      const { data } = await admin.storage.from(bucket).list(path, { limit: 1000 });
      paths.push(...(await collectPaths(admin, bucket, path, data ?? [])));
    }
  }
  return paths;
}
