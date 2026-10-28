"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { OPT_INS, OUTCOMES, STRESS, USEFULNESS } from "@/content/day-plus-100";
import { submitDayPlus100 } from "@/lib/actions/day-plus-100";
import { cn } from "@/lib/utils";

function Choices({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2" aria-invalid={error ? true : undefined}>
      <legend className="text-navy-900 mb-2 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center rounded-lg border px-3 text-sm font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--color-gold-400)]",
              value === o.value
                ? "border-navy-900 bg-navy-900 text-cream-50"
                : "text-navy-900 bg-white",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </fieldset>
  );
}

const scale = (labels: readonly string[]) =>
  labels.map((label, i) => ({ value: String(i + 1), label }));

/** Three minutes: where you are now, how useful it was, stress, two optional notes, opt-ins. */
export function CheckInForm() {
  const router = useRouter();
  const [outcome, setOutcome] = useState("");
  const [usefulness, setUsefulness] = useState("");
  const [stress, setStress] = useState("");
  const [optIns, setOptIns] = useState({
    optInMentor: false,
    optInSession: false,
    optInGive: false,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setFormError(undefined);
    startTransition(async () => {
      const result = await submitDayPlus100({
        outcome,
        usefulness,
        stress,
        mostUseful: String(form.get("mostUseful") ?? ""),
        improve: String(form.get("improve") ?? ""),
        ...optIns,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <Choices
        name="outcome"
        legend="What are you doing now?"
        options={OUTCOMES.map((o) => ({ value: o.id, label: o.label }))}
        value={outcome}
        onChange={setOutcome}
        error={errors.outcome?.[0]}
      />
      <Choices
        name="usefulness"
        legend="How useful was your Beyond Blue plan once you graduated?"
        options={scale(USEFULNESS)}
        value={usefulness}
        onChange={setUsefulness}
        error={errors.usefulness?.[0]}
      />
      <Choices
        name="stress"
        legend="Compared with graduation day, how stressed do you feel about what's next?"
        options={scale(STRESS)}
        value={stress}
        onChange={setStress}
        error={errors.stress?.[0]}
      />
      <Field>
        <FieldLabel htmlFor="most-useful">What helped most? (optional)</FieldLabel>
        <Textarea id="most-useful" name="mostUseful" rows={3} maxLength={500} />
      </Field>
      <Field>
        <FieldLabel htmlFor="improve">What should we change for next year? (optional)</FieldLabel>
        <Textarea id="improve" name="improve" rows={3} maxLength={500} />
      </Field>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-navy-900 mb-2 font-semibold">Pay it forward (optional)</legend>
        {OPT_INS.map((o) => (
          <div key={o.id} className="flex items-start gap-3">
            <Checkbox
              id={o.id}
              checked={optIns[o.id]}
              onCheckedChange={(v) => setOptIns((s) => ({ ...s, [o.id]: v === true }))}
              className="mt-0.5"
            />
            <label htmlFor={o.id} className="text-ink-900 text-sm">
              {o.label}
            </label>
          </div>
        ))}
      </fieldset>
      <p className="text-body-sm text-ink-600">
        Staff only ever see totals and percentages for groups of five or more. Your answers are
        never shown with your name.
      </p>
      {formError && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send my check-in"}
      </Button>
    </form>
  );
}
