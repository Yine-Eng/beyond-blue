"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/auth/routes";
import { RATE_LIMITS, checkRateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type ActionResult, fail, ok, withValidation } from "./action-result";

const signInSchema = z.object({
  email: z.email("Enter a valid email address.").max(254).toLowerCase(),
  next: z.string().max(200).optional(),
});

function domainAllowed(email: string): boolean {
  const allowed = (process.env.AUTH_ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return allowed.length === 0 || allowed.some((d) => email.endsWith(`@${d}`));
}

/** Sends a magic link. Returns the same message whether or not the account exists. */
export async function requestMagicLink(
  _prev: ActionResult<{ email: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ email: string }>> {
  return withValidation(
    signInSchema,
    { email: formData.get("email"), next: formData.get("next") ?? undefined },
    async ({ email, next }) => {
      if (!domainAllowed(email)) {
        return fail("Use your university email address.", {
          email: ["Use your university email address."],
        });
      }
      const ip = await clientIp();
      const [perEmail, perIp] = await Promise.all([
        checkRateLimit(`magic:email:${email}`, RATE_LIMITS.magicLinkPerEmail),
        checkRateLimit(`magic:ip:${ip}`, RATE_LIMITS.magicLinkPerIp),
      ]);
      if (!perEmail || !perIp)
        return fail("Too many sign-in attempts. Please wait a few minutes and try again.");

      const supabase = await createSupabaseServerClient();
      const callback = new URL("/auth/callback", getSiteUrl());
      callback.searchParams.set("next", safeNextPath(next));
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callback.href, shouldCreateUser: true },
      });
      if (error) {
        console.error(
          JSON.stringify({ event: "magic_link_error", status: error.status, code: error.code }),
        );
        return fail("We couldn't send the link right now. Please try again in a minute.");
      }
      return ok({ email });
    },
  );
}

/** Signs out this browser only. The default "global" scope would end every session on the account. */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
