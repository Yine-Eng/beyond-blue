import type { z } from "zod";

/** Typed result every Server Action returns (docs/adr/0003-data-access-pattern.md). */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      /** A machine-readable reason, for forms that offer a different next step. */
      code?: string;
    };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export const fail = (
  error: string,
  fieldErrors?: Record<string, string[]>,
  code?: string,
): ActionResult<never> => ({
  ok: false,
  error,
  fieldErrors,
  ...(code && { code }),
});

/** Turns a Zod error into per-field messages for forms. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/**
 * Validate input with a Zod schema before running the action body. Authentication and
 * authorization happen inside the body, close to the data, as Next.js recommends.
 */
export async function withValidation<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  run: (data: z.infer<S>) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return fail("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));
  try {
    return await run(parsed.data);
  } catch (error) {
    // Let Next.js navigation signals (redirect, notFound) pass through.
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error(JSON.stringify({ event: "action_error", message: (error as Error).message }));
    return fail("Something went wrong. Please try again.");
  }
}
