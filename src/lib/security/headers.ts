type Env = {
  [key: string]: string | undefined;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
};

/**
 * Content Security Policy without nonces (nonces force dynamic rendering, which would break the
 * prerendered static shells). See node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md.
 */
export function buildContentSecurityPolicy(env: Env): string {
  const isDev = env.NODE_ENV === "development";
  const isPreview = env.VERCEL_ENV === "preview";

  let supabase: string[] = [];
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    const { origin, host } = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
    supabase = [origin, `wss://${host}`];
  }
  // Vercel's preview toolbar and comments.
  const vercelLive = isPreview ? ["https://vercel.live"] : [];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...vercelLive],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:", ...supabase.slice(0, 1), ...vercelLive],
    "font-src": ["'self'", "data:", ...vercelLive],
    "connect-src": [
      "'self'",
      ...supabase,
      ...vercelLive,
      ...(isPreview ? ["wss://ws-us3.pusher.com"] : []),
    ],
    "frame-src": vercelLive.length ? vercelLive : ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!isDev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

/** Security headers applied to every route (docs/architecture.md §7.4). */
export function securityHeaders(env: Env): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(env) },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
  ];
}
