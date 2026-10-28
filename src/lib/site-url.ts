type Env = {
  [key: string]: string | undefined;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
  VERCEL_URL?: string;
};

/**
 * Absolute base URL for metadata and auth redirects.
 * Production sets NEXT_PUBLIC_SITE_URL; Vercel previews fall back to their deployment URL;
 * local development falls back to localhost:3000.
 */
export function getSiteUrl(env: Env = process.env): URL {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = (env.NEXT_PUBLIC_VERCEL_URL ?? env.VERCEL_URL)?.trim();
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
