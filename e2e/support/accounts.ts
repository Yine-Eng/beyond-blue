import { randomBytes } from "node:crypto";
import type { BrowserContext } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";

/**
 * Test accounts and cleanup. CI and local e2e runs talk to the hosted Supabase project, so every
 * account a test creates (demo sessions included) is deleted when the test ends, along with its
 * stored files and audit rows. Only anonymous demo users and `e2e-…@example.test` accounts are ever
 * deleted, so pointing the suite at a real deployment can't touch real people.
 */

const BUCKETS = ["task-outputs", "avatars", "fund-docs"] as const;
const E2E_EMAIL = /^e2e-[a-z0-9-]+@example\.test$/;

let adminClient: SupabaseClient | null = null;

export const hasAdmin = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

export function admin(): SupabaseClient {
  adminClient ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return adminClient;
}

/** The signed-in user id from the browser's Supabase auth cookie (possibly chunked). */
export async function sessionUserId(context: BrowserContext): Promise<string | null> {
  const cookies = (await context.cookies()).filter((c) =>
    /^sb-.+-auth-token(\.\d+)?$/.test(c.name),
  );
  if (!cookies.length) return null;
  const raw = cookies
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
    .map((c) => c.value)
    .join("");
  try {
    const json = raw.startsWith("base64-")
      ? Buffer.from(raw.slice("base64-".length), "base64url").toString("utf8")
      : decodeURIComponent(raw);
    return (JSON.parse(json) as { user?: { id?: string } }).user?.id ?? null;
  } catch {
    return null;
  }
}

async function listFiles(bucket: string, prefix: string): Promise<string[]> {
  const { data } = await admin().storage.from(bucket).list(prefix, { limit: 1000 });
  const paths: string[] = [];
  for (const entry of data ?? []) {
    const path = `${prefix}/${entry.name}`;
    if (entry.id) paths.push(path);
    else paths.push(...(await listFiles(bucket, path)));
  }
  return paths;
}

/** Deletes a test-created user and everything it left behind. Refuses anyone else. */
export async function deleteTestUser(id: string): Promise<void> {
  const { data, error } = await admin().auth.admin.getUserById(id);
  if (error || !data.user) return;
  const { is_anonymous, email } = data.user;
  if (!is_anonymous && !E2E_EMAIL.test(email ?? "")) {
    throw new Error(`Refusing to delete non-test user ${id}`);
  }
  for (const bucket of BUCKETS) {
    const paths = await listFiles(bucket, id);
    if (paths.length) await admin().storage.from(bucket).remove(paths);
  }
  await admin().from("audit_log").delete().eq("actor_id", id);
  const { error: deleteError } = await admin().auth.admin.deleteUser(id);
  if (deleteError) throw deleteError;
}

export type TestRole = "student" | "mentor" | "staff";

/**
 * Creates an `e2e-…@example.test` account with the given role and signs the browser context in
 * with it (password sign-in in Node, then the same cookies @supabase/ssr would set). The magic
 * link itself needs a mail server, so it isn't used here.
 */
export async function signInAs(
  context: BrowserContext,
  baseURL: string,
  role: TestRole,
  setup?: (userId: string) => Promise<void>,
): Promise<string> {
  const email = `e2e-${role}-${randomBytes(5).toString("hex")}@example.test`;
  const password = randomBytes(24).toString("base64url");
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");
  const id = data.user.id;

  const { error: roleError } = await admin()
    .from("profiles")
    .update({ role, preferred_name: `E2E ${role}`, full_name: `E2E ${role}` })
    .eq("id", id);
  if (roleError) throw roleError;
  await setup?.(id);

  let jar: { name: string; value: string }[] = [];
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar,
        setAll: (cookies) => {
          jar = cookies.map(({ name, value }) => ({ name, value }));
        },
      },
    },
  );
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  await context.addCookies(jar.map((c) => ({ ...c, url: baseURL })));
  return id;
}
