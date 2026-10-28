/** App routes that need a signed-in user (the proxy redirects; the DAL enforces). */
export const PROTECTED_PREFIXES = [
  "/home",
  "/plan",
  "/network",
  "/profile",
  "/onboarding",
  "/tasks",
  "/launch-file",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Only allow same-site relative redirects (prevents open redirects via ?next=). */
export function safeNextPath(next: string | null | undefined, fallback = "/plan"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\"))
    return fallback;
  return next;
}
