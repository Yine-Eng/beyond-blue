import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Magic-link landing: exchange the one-time code for a session, then continue. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    console.error(JSON.stringify({ event: "auth_callback_error", code: error.code }));
  }

  const signIn = new URL("/sign-in", origin);
  signIn.searchParams.set("error", "link");
  return NextResponse.redirect(signIn);
}
