"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FUND_CATEGORIES, FUND_DOCUMENT_TYPES } from "@/content/fund";
import { prepareFundUpload, submitFundRequest } from "@/lib/actions/fund";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Initial = {
  id: string;
  category: string;
  amount: number;
  nextStep: string;
  justification: string;
  neededBy: string;
};

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border bg-white px-3 text-base focus-visible:ring-3 focus-visible:outline-none aria-invalid:border-destructive";

export function FundRequestForm({
  capDollars,
  initial,
}: {
  capDollars: number;
  initial?: Initial;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setFormError(undefined);
    setErrors({});
    startTransition(async () => {
      const fail = (message: string, fieldErrors: Record<string, string[]> = {}) => {
        setErrors(fieldErrors);
        setFormError(message);
      };

      let documentPath: string | undefined;
      const file = form.get("document");
      if (file instanceof File && file.size > 0) {
        const prepared = await prepareFundUpload({ mime: file.type, size: file.size });
        if (!prepared.ok)
          return fail(prepared.error, {
            document: prepared.fieldErrors?.mime ?? prepared.fieldErrors?.size ?? [prepared.error],
          });
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.storage
          .from("fund-docs")
          .uploadToSignedUrl(prepared.data.path, prepared.data.token, file, {
            contentType: file.type,
          });
        if (error) return fail("The upload didn't finish. Please try again.");
        documentPath = prepared.data.path;
      }

      const result = await submitFundRequest(
        {
          category: form.get("category"),
          amount: form.get("amount"),
          nextStep: form.get("nextStep"),
          justification: form.get("justification"),
          neededBy: form.get("neededBy"),
          documentPath,
        },
        initial?.id,
      );
      if (!result.ok) return fail(result.error, result.fieldErrors);
      router.refresh();
    });
  };

  const err = (name: string) => errors[name]?.[0];
  const invalid = (name: string) => (errors[name] ? true : undefined);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="fund-category">What is it for?</FieldLabel>
        <select
          id="fund-category"
          name="category"
          defaultValue={initial?.category ?? ""}
          className={SELECT_CLASS}
          aria-invalid={invalid("category")}
          required
        >
          <option value="" disabled>
            Choose a category
          </option>
          {FUND_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {err("category") && <FieldError>{err("category")}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="fund-amount">Amount (whole dollars, up to ${capDollars})</FieldLabel>
        <div className="relative">
          <span
            aria-hidden="true"
            className="text-ink-600 absolute top-1/2 left-3 -translate-y-1/2"
          >
            $
          </span>
          <Input
            id="fund-amount"
            name="amount"
            inputMode="numeric"
            className="pl-7"
            defaultValue={initial?.amount}
            aria-invalid={invalid("amount")}
            required
          />
        </div>
        {err("amount") && <FieldError>{err("amount")}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="fund-next-step">Which next step does this unlock?</FieldLabel>
        <Input
          id="fund-next-step"
          name="nextStep"
          maxLength={200}
          placeholder="Sign the lease for my first apartment in Atlanta"
          defaultValue={initial?.nextStep}
          aria-invalid={invalid("nextStep")}
          required
        />
        {err("nextStep") && <FieldError>{err("nextStep")}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="fund-justification">Why do you need help with this cost?</FieldLabel>
        <FieldDescription>
          50 to 1,000 characters. Share only what the review needs.
        </FieldDescription>
        <Textarea
          id="fund-justification"
          name="justification"
          rows={5}
          maxLength={1000}
          defaultValue={initial?.justification}
          aria-invalid={invalid("justification")}
          required
        />
        {err("justification") && <FieldError>{err("justification")}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="fund-needed-by">Needed by</FieldLabel>
        <Input
          id="fund-needed-by"
          name="neededBy"
          type="date"
          defaultValue={initial?.neededBy}
          aria-invalid={invalid("neededBy")}
          required
        />
        {err("neededBy") && <FieldError>{err("neededBy")}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="fund-document">Supporting document (optional)</FieldLabel>
        <FieldDescription>
          A quote, invoice or fee notice. PDF or image, up to 10 MB.
          {initial ? " Leave empty to keep the one you sent." : ""}
        </FieldDescription>
        <Input
          id="fund-document"
          name="document"
          type="file"
          accept={FUND_DOCUMENT_TYPES.join(",")}
          className="h-auto py-2"
          aria-invalid={invalid("document")}
        />
        {err("document") && <FieldError>{err("document")}</FieldError>}
      </Field>

      <p className="text-body-sm text-ink-600 bg-cream-50 rounded-lg px-4 py-3">
        We never ask for bank or card details. If approved, the university pays the cost directly or
        through your student account.
      </p>

      {formError && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        <Send aria-hidden="true" />
        {pending ? "Sending…" : initial ? "Send updated request" : "Send my request"}
      </Button>
    </form>
  );
}
