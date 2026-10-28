"use client";

import { ArrowLeft, ArrowRight, Check, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FORMS } from "@/content/curriculum";
import { DETOUR_STEPS, type DetourField, type DetourPrompts } from "@/content/detour";
import { finishDetour, saveDetourStep } from "@/lib/actions/detour";
import { cn } from "@/lib/utils";

type Answers = Partial<Record<DetourField, string>>;

const DETOUR_OPTIONS = (() => {
  const field = FORMS["detour-plan"].fields.find((f) => f.name === "detour");
  return field?.kind === "select" ? field.options : [];
})();

type Props = {
  prompts: DetourPrompts;
  initialAnswers: Answers;
  initialStep: number;
  initiallyDone: boolean;
};

export function DetourBuilder({ prompts, initialAnswers, initialStep, initiallyDone }: Props) {
  const [step, setStep] = useState(initiallyDone ? 0 : Math.min(Math.max(initialStep, 1), 5) - 1);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();
  const [done, setDone] = useState(initiallyDone);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const current = DETOUR_STEPS[step]!;
  const value = answers[current.field] ?? "";
  const set = (v: string) => setAnswers((a) => ({ ...a, [current.field]: v }));

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    if (!value.trim()) return setErrors({ [current.field]: ["This field is required."] });
    setFormError(undefined);
    startTransition(async () => {
      const isLast = step === DETOUR_STEPS.length - 1;
      const result = isLast
        ? await finishDetour({ answers })
        : await saveDetourStep({ step: step + 2, answers });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        const firstBad = DETOUR_STEPS.findIndex((s) => result.fieldErrors?.[s.field]);
        if (firstBad >= 0 && firstBad !== step) goTo(firstBad);
        return;
      }
      if (isLast) {
        setDone(true);
        requestAnimationFrame(() => headingRef.current?.focus());
      } else goTo(step + 1);
    });
  };

  if (done)
    return (
      <section className="flex flex-col gap-5" aria-labelledby="detour-done">
        <div className="bg-success-50 rounded-card p-5">
          <h2
            id="detour-done"
            ref={headingRef}
            tabIndex={-1}
            className="text-heading-md text-navy-900 flex items-center gap-2 font-semibold outline-none"
          >
            <Check aria-hidden="true" className="size-5 text-green-700" /> Detour plan saved to your
            Launch File.
          </h2>
          <p className="text-body-sm text-ink-900 mt-2">
            If plan A changes, you already know your first step. You can update this plan any time.
          </p>
        </div>
        <SupportList />
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/plan">Back to your plan</Link>
          </Button>
          <Button variant="outline" className="bg-white" onClick={() => (setDone(false), goTo(0))}>
            Edit my Detour plan
          </Button>
        </div>
      </section>
    );

  const id = `detour-${current.field}`;
  const error = errors[current.field]?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
          Step {step + 1} of {DETOUR_STEPS.length}
        </p>
        <ol aria-hidden="true" className="mt-2 flex gap-2">
          {DETOUR_STEPS.map((s, i) => (
            <li
              key={s.field}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= step ? "bg-navy-900" : "bg-cream-200",
              )}
            />
          ))}
        </ol>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-hand text-navy-900 mt-4 text-3xl outline-none"
        >
          {current.title}
        </h2>
      </div>

      {current.field === "detour" ? (
        <Field>
          <FieldLabel id="detour-label">
            What&apos;s most likely to knock plan A off course?
          </FieldLabel>
          <FieldDescription>
            Most students on your pathway plan for &ldquo;{prompts.likelyDetour}&rdquo; first.
          </FieldDescription>
          <RadioGroup
            aria-labelledby="detour-label"
            value={value}
            onValueChange={set}
            className="gap-2"
            aria-invalid={error ? true : undefined}
          >
            {DETOUR_OPTIONS.map((option) => (
              <label
                key={option}
                htmlFor={`detour-opt-${slug(option)}`}
                className={cn(
                  "rounded-card flex min-h-12 cursor-pointer items-center gap-3 border-2 bg-white px-4 py-2",
                  value === option ? "border-navy-900 bg-area-wellness" : "border-border",
                )}
              >
                <RadioGroupItem id={`detour-opt-${slug(option)}`} value={option} />
                <span className="text-navy-900 font-semibold">{option}</span>
              </label>
            ))}
          </RadioGroup>
          {error && <FieldError>{error}</FieldError>}
        </Field>
      ) : (
        <Field>
          <FieldLabel htmlFor={id}>{promptFor(prompts, current.field)}</FieldLabel>
          {current.field === "minBudget" ? (
            <>
              <FieldDescription>
                Rent, food, phone, transport and minimum debt payments. Whole dollars.
              </FieldDescription>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="text-ink-600 absolute top-1/2 left-3 -translate-y-1/2"
                >
                  $
                </span>
                <Input
                  id={id}
                  inputMode="numeric"
                  className="pl-7"
                  value={value}
                  onChange={(e) => set(e.target.value.replace(/[^\d]/g, ""))}
                  aria-invalid={error ? true : undefined}
                />
              </div>
            </>
          ) : current.field === "planA" ? (
            <Input
              id={id}
              value={value}
              maxLength={200}
              placeholder={prompts.planA.placeholder}
              onChange={(e) => set(e.target.value)}
              aria-invalid={error ? true : undefined}
            />
          ) : (
            <Textarea
              id={id}
              value={value}
              rows={4}
              maxLength={current.field === "signs" ? 600 : 800}
              placeholder={prompts[current.field].placeholder}
              onChange={(e) => set(e.target.value)}
              aria-invalid={error ? true : undefined}
            />
          )}
          {error && <FieldError>{error}</FieldError>}
        </Field>
      )}

      {current.field === "minBudget" && <SupportList />}

      {formError && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            onClick={() => goTo(step - 1)}
            disabled={pending}
          >
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
        )}
        <Button type="button" className="flex-1" onClick={next} disabled={pending}>
          {step === DETOUR_STEPS.length - 1
            ? pending
              ? "Saving…"
              : "Finish my Detour plan"
            : pending
              ? "Saving…"
              : "Save and continue"}
          {!pending && <ArrowRight aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}

function promptFor(prompts: DetourPrompts, field: DetourField): string {
  if (field === "minBudget") return prompts.budget.prompt;
  if (field === "detour") return "";
  return prompts[field].prompt;
}

function SupportList() {
  return (
    <aside aria-labelledby="support-title" className="rounded-card border bg-white p-5">
      <h3 id="support-title" className="text-navy-900 flex items-center gap-2 font-semibold">
        <LifeBuoy aria-hidden="true" className="size-5" /> You don&apos;t have to detour alone
      </h3>
      <ul className="text-body-sm text-ink-900 mt-3 flex flex-col gap-2">
        <li>
          <strong>Career Services</strong> can help you restart a search, review offers and practise
          interviews.
        </li>
        <li>
          <strong>Counseling</strong> is free and confidential when a change feels like a lot.
        </li>
        <li>
          <strong>Last Mile Fund</strong> covers small, verified costs tied to your next step, up to
          $250 per request.
        </li>
      </ul>
    </aside>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
