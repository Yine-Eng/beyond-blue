import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isProtectedPath } from "@/lib/auth/routes";

/**
 * Refreshes the Supabase session cookie on every app request and sends signed-out visitors to
 * sign-in. This is an optimistic check only; pages and Server Actions verify the user again
 * through the data access layer (src/lib/auth/session.ts).
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const { pathname, search } = request.nextUrl;

  let response = NextResponse.next({ request });
  let signedIn = false;

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    // getClaims() validates the JWT and refreshes an expired session.
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims?.sub);
  }

  if (!signedIn && isProtectedPath(pathname)) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/sign-in";
    signIn.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(signIn);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/plan/:path*",
    "/network/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/tasks/:path*",
    "/mentor/:path*",
    "/launch-file/:path*",
    "/switch-pathway/:path*",
    "/detour/:path*",
    "/fund/:path*",
    "/day-plus-100/:path*",
    "/staff/:path*",
    "/auth/:path*",
    "/sign-in",
  ],
};
