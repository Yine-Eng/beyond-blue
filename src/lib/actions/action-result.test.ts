// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ok, withValidation } from "./action-result";

const schema = z.object({ city: z.string().min(3, "Enter at least 3 characters.") });

describe("withValidation", () => {
  it("returns field errors without running the action when input is invalid", async () => {
    let ran = false;
    const result = await withValidation(schema, { city: "AT" }, async () => {
      ran = true;
      return ok(undefined);
    });
    expect(ran).toBe(false);
    expect(result).toEqual({
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { city: ["Enter at least 3 characters."] },
    });
  });

  it("passes parsed data to the action", async () => {
    const result = await withValidation(schema, { city: "Atlanta" }, async ({ city }) => ok(city));
    expect(result).toEqual({ ok: true, data: "Atlanta" });
  });

  it("hides unexpected errors behind a friendly message", async () => {
    const result = await withValidation(schema, { city: "Atlanta" }, async () => {
      throw new Error("database exploded");
    });
    expect(result).toEqual({ ok: false, error: "Something went wrong. Please try again." });
  });

  it("re-throws Next.js navigation signals", async () => {
    const redirectError = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;/home",
    });
    await expect(
      withValidation(schema, { city: "Atlanta" }, async () => {
        throw redirectError;
      }),
    ).rejects.toBe(redirectError);
  });
});
