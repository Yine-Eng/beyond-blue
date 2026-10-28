import { z } from "zod";
import { DOCUMENT_TYPES, FORMS, type FormField, type FormId } from "@/content/curriculum";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_DEMO_UPLOAD_BYTES = 2 * 1024 * 1024;

const EXTENSIONS: Record<(typeof DOCUMENT_TYPES)[number], string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export const extensionFor = (mime: string) => EXTENSIONS[mime as keyof typeof EXTENSIONS];

function fieldSchema(field: FormField): z.ZodType {
  const required = field.required ?? false;
  switch (field.kind) {
    case "money": {
      const n = z.coerce
        .number({ error: "Enter a whole-dollar amount." })
        .int("Use whole dollars.")
        .min(0, "Must be 0 or more.")
        .max(1_000_000, "That looks too large.");
      // Treat a blank box as missing; otherwise Number("") would silently become $0.
      const blankAsMissing = (v: unknown) => (v === "" || v === null ? undefined : v);
      return z.preprocess(blankAsMissing, required ? n : n.optional());
    }
    case "date": {
      const d = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");
      return required ? d : z.union([z.literal(""), d]).optional();
    }
    case "select": {
      const s = z.enum(field.options as unknown as [string, ...string[]], {
        error: "Choose an option.",
      });
      return required ? s : z.union([z.literal(""), s]).optional();
    }
    default: {
      const max = field.max ?? (field.kind === "textarea" ? 1000 : 200);
      const t = z.string().trim().max(max, `Keep it under ${max} characters.`);
      return required ? t.min(1, "This field is required.") : t.optional();
    }
  }
}

/** Zod schema for a curriculum form, built from its field definitions. */
export function formSchema(formId: FormId) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of FORMS[formId].fields) shape[field.name] = fieldSchema(field);
  return z.object(shape);
}

export const linkSchema = z
  .string()
  .trim()
  .url("Enter a full link, starting with https://")
  .refine((v) => v.startsWith("https://"), "Links must start with https://")
  .max(2000);

export const uploadRequestSchema = z.object({
  taskId: z.string().min(3).max(120),
  mime: z.enum(DOCUMENT_TYPES as unknown as [string, ...string[]], {
    error: "Upload a PDF, image (PNG, JPG, WebP) or Word document.",
  }),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Files must be 10 MB or smaller."),
});

export const completeTaskSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("link"), taskId: z.string().min(3).max(120), url: linkSchema }),
  z.object({
    type: z.literal("file"),
    taskId: z.string().min(3).max(120),
    path: z.string().min(10).max(300),
  }),
  z.object({
    type: z.literal("form"),
    taskId: z.string().min(3).max(120),
    data: z.record(z.string(), z.unknown()),
  }),
]);
