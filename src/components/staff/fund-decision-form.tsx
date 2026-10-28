"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FUND_RUBRIC, type RubricId } from "@/content/fund";
import { decideFundRequest } from "@/lib/actions/fund";
import { cn } from "@/lib/utils";

type Decision = "in_review" | "needs_info" | "approved" | "declined";
type Answer = "yes" | "no" | undefined;

const DECISIONS: { id: Decision; label: string; variant: "default" | "outline" }[] = [
  { id: "approved", label: "Approve", variant: "default" },
  { id: "needs_info", label: "Ask for more info", variant: "outline" },
  { id: "declined", label: "Decline", variant: "outline" },
  { id: "in_review", label: "Mark in review", variant: "outline" },
];

/** Rubric first (yes/no for each item), then a note, then the decision. */
export function FundDecisionForm({
  id,
  initialRubric,
}: {
  id: string;
  initialRubric: Record<string, boolean> | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Partial<Record<RubricId, Answer>>>(() =>
    Object.fromEntries(
      FUND_RUBRIC.map((r) => [
        r.id,
        initialRubric?.[r.id] === undefined ? undefined : initialRubric[r.id] ? "yes" : "no",
      ]),
    ),
  );
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const complete = FUND_RUBRIC.every((r) => answers[r.id]);
  const allMet = FUND_RUBRIC.every((r) => answers[r.id] === "yes");

  const decide = (status: Decision) => {
    setFormError(undefined);
    setErrors({});
    if (!complete) return setErrors({ rubric: ["Complete the rubric before deciding."] });
    startTransition(async () => {
      const rubric = Object.fromEntries(FUND_RUBRIC.map((r) => [r.id, answers[r.id] === "yes"]));
      const result = await decideFundRequest({ id, status, rubric, note });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        return;
      }
      toast.success("Decision saved.");
      setNote("");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <FieldSet>
        <FieldLegend className="text-heading-md text-navy-900 font-semibold">Rubric</FieldLegend>
        <ul className="flex flex-col gap-2">
          {FUND_RUBRIC.map((item) => (
            <li
              key={item.id}
              className="rounded-card flex flex-wrap items-center justify-between gap-2 border bg-white px-4 py-3"
            >
              <span id={`rubric-${item.id}`} className="text-navy-900 text-sm font-semibold">
                {item.label}
              </span>
              <div role="radiogroup" aria-labelledby={`rubric-${item.id}`} className="flex gap-2">
                {(["yes", "no"] as const).map((value) => (
                  <label
                    key={value}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold",
                      answers[item.id] === value
                        ? "border-navy-900 bg-navy-900 text-cream-50"
                        : "text-navy-900 bg-white",
                    )}
                  >
                    <input
                      type="radio"
                      name={`rubric-${item.id}`}
                      value={value}
                      checked={answers[item.id] === value}
                      onChange={() => setAnswers((a) => ({ ...a, [item.id]: value }))}
                      className="sr-only"
                    />
                    {value === "yes" ? "Met" : "Not met"}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
        {errors.rubric && <FieldError>{errors.rubric[0]}</FieldError>}
      </FieldSet>

      <Field>
        <FieldLabel htmlFor="decision-note">Decision note (the student sees this)</FieldLabel>
        <Textarea
          id="decision-note"
          rows={3}
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-invalid={errors.note ? true : undefined}
        />
        {errors.note && <FieldError>{errors.note[0]}</FieldError>}
      </Field>

      {formError && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {DECISIONS.map((d) => (
          <Button
            key={d.id}
            type="button"
            variant={d.variant}
            className={d.variant === "outline" ? "bg-white" : undefined}
            disabled={pending || (d.id === "approved" && complete && !allMet)}
            onClick={() => decide(d.id)}
          >
            {d.label}
          </Button>
        ))}
      </div>
      {complete && !allMet && (
        <p className="text-body-sm text-ink-600">
          Approval needs every rubric item met. Ask for more info or decline instead.
        </p>
      )}
    </div>
  );
}
