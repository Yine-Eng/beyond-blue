"use client";

import { CheckCircle2, ExternalLink, FileUp, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DOCUMENT_TYPES, FORMS, type FormField, type FormId } from "@/content/curriculum";
import { completeTask, prepareUpload, undoTask } from "@/lib/actions/tasks";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Existing = {
  outputUrl: string | null;
  outputData: Record<string, unknown> | null;
  fileUrl: string | null;
  completedAt: string;
} | null;

type TaskOutputFormProps = {
  taskId: string;
  areaId: string;
  outputType: "file" | "link" | "form";
  formId: FormId | null;
  existing: Existing;
};

export function TaskOutputForm({
  taskId,
  areaId,
  outputType,
  formId,
  existing,
}: TaskOutputFormProps) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(!existing);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const fail = (message: string, fields: Record<string, string[]> = {}) => {
    setFormError(message);
    setErrors(fields);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormError(undefined);
    setErrors({});

    startTransition(async () => {
      let result;
      if (outputType === "link") {
        result = await completeTask({
          type: "link",
          taskId,
          url: String(formData.get("url") ?? ""),
        });
      } else if (outputType === "form") {
        result = await completeTask({ type: "form", taskId, data: Object.fromEntries(formData) });
      } else {
        const file = fileRef.current?.files?.[0];
        if (!file) return fail("Choose a file to upload.", { file: ["Choose a file to upload."] });
        const prepared = await prepareUpload({ taskId, mime: file.type, size: file.size });
        if (!prepared.ok)
          return fail(prepared.error, {
            file:
              prepared.fieldErrors?.mime ??
              prepared.fieldErrors?.size ??
              prepared.fieldErrors?.file ??
              [],
          });
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.storage
          .from("task-outputs")
          .uploadToSignedUrl(prepared.data.path, prepared.data.token, file, {
            contentType: file.type,
          });
        if (error) return fail("The upload didn't finish. Please try again.");
        result = await completeTask({ type: "file", taskId, path: prepared.data.path });
      }
      if (!result.ok) return fail(result.error, result.fieldErrors);
      setSaved(true);
      setEditing(false);
    });
  };

  const undo = () =>
    startTransition(async () => {
      const result = await undoTask(taskId);
      if (!result.ok) return fail(result.error);
      setSaved(false);
      setEditing(true);
    });

  if (saved) {
    return (
      <div
        role="status"
        className="bg-success-50 rounded-card flex flex-col items-center gap-3 p-6 text-center"
      >
        <CheckCircle2 aria-hidden="true" className="check-burst size-14 text-green-700" />
        <p className="text-heading-md text-navy-900 font-semibold">Step complete!</p>
        <p className="text-ink-600">Saved to your Launch File.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/plan">Back to your plan</Link>
          </Button>
          <Button asChild variant="outline" className="bg-white">
            <Link href={`/plan/${areaId}`}>See this area</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (existing && !editing) {
    return (
      <div className="bg-success-50 rounded-card flex flex-col gap-3 p-5">
        <p className="text-navy-900 flex items-center gap-2 font-semibold">
          <CheckCircle2 aria-hidden="true" className="size-5 text-green-700" />
          Completed{" "}
          {new Date(existing.completedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <SavedOutput existing={existing} formId={formId} />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="bg-white" onClick={() => setEditing(true)}>
            Replace output
          </Button>
          <Button variant="ghost" onClick={undo} disabled={pending}>
            <Undo2 aria-hidden="true" /> Mark as not done
          </Button>
        </div>
        {formError && (
          <p role="alert" className="text-danger text-sm font-semibold">
            {formError}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {outputType === "link" && (
        <Field data-invalid={errors.url ? true : undefined}>
          <FieldLabel htmlFor="url">Link to your work</FieldLabel>
          <Input
            id="url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={existing?.outputUrl ?? ""}
            aria-invalid={errors.url ? true : undefined}
            required
          />
          {errors.url ? (
            <FieldError>{errors.url[0]}</FieldError>
          ) : (
            <FieldDescription>
              A document, profile, folder or page that shows what you did.
            </FieldDescription>
          )}
        </Field>
      )}

      {outputType === "file" && (
        <Field data-invalid={errors.file ? true : undefined}>
          <FieldLabel htmlFor="file">Upload your file</FieldLabel>
          <Input
            id="file"
            ref={fileRef}
            type="file"
            accept={DOCUMENT_TYPES.join(",")}
            aria-invalid={errors.file ? true : undefined}
            className="h-auto py-2"
            required
          />
          {errors.file?.length ? (
            <FieldError>{errors.file[0]}</FieldError>
          ) : (
            <FieldDescription>
              PDF, PNG, JPG, WebP or Word document, up to 10 MB. Only you and your advisors can see
              it.
            </FieldDescription>
          )}
        </Field>
      )}

      {outputType === "form" && formId && (
        <>
          <p className="text-ink-600">{FORMS[formId].intro}</p>
          {(FORMS[formId].fields as readonly FormField[]).map((field) => {
            const id = `f-${field.name}`;
            const error = errors[field.name]?.[0];
            const value = existing?.outputData?.[field.name];
            const common = {
              id,
              name: field.name,
              defaultValue: value === undefined || value === null ? "" : String(value),
              "aria-invalid": error ? true : undefined,
              required: field.required,
            };
            return (
              <Field key={field.name} data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor={id}>
                  {field.label}
                  {!field.required && <span className="text-ink-600 font-normal"> (optional)</span>}
                </FieldLabel>
                {field.kind === "textarea" ? (
                  <Textarea {...common} maxLength={field.max} rows={4} />
                ) : field.kind === "select" ? (
                  <select
                    {...common}
                    className="border-input h-11 rounded-lg border bg-white px-3 text-base md:text-sm"
                  >
                    <option value="">Choose…</option>
                    {field.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : field.kind === "money" ? (
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="text-ink-600 absolute top-1/2 left-3 -translate-y-1/2"
                    >
                      $
                    </span>
                    <Input
                      {...common}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      className="pl-7"
                    />
                  </div>
                ) : field.kind === "date" ? (
                  <Input {...common} type="date" />
                ) : (
                  <Input {...common} maxLength={field.max} />
                )}
                {error && <FieldError>{error}</FieldError>}
              </Field>
            );
          })}
        </>
      )}

      {formError && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {formError}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {outputType === "file" && <FileUp aria-hidden="true" />}
          {pending ? "Saving…" : "Mark complete"}
        </Button>
        {existing && (
          <Button type="button" variant="ghost" size="lg" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function SavedOutput({
  existing,
  formId,
}: {
  existing: NonNullable<Existing>;
  formId: FormId | null;
}) {
  if (existing.outputUrl || existing.fileUrl) {
    const href = (existing.outputUrl ?? existing.fileUrl)!;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold text-blue-700 underline underline-offset-4"
      >
        {existing.fileUrl ? "Open your uploaded file" : href}
        <ExternalLink aria-hidden="true" className="size-4" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  if (existing.outputData && formId) {
    return (
      <dl className="grid gap-2 text-sm">
        {(FORMS[formId].fields as readonly FormField[])
          .filter(
            (f) =>
              existing.outputData?.[f.name] !== undefined && existing.outputData?.[f.name] !== "",
          )
          .map((f) => (
            <div key={f.name}>
              <dt className="text-ink-600 font-semibold">{f.label}</dt>
              <dd className="text-ink-900 whitespace-pre-line">
                {f.kind === "money"
                  ? `$${Number(existing.outputData?.[f.name]).toLocaleString("en-US")}`
                  : String(existing.outputData?.[f.name])}
              </dd>
            </div>
          ))}
      </dl>
    );
  }
  return null;
}
