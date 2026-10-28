"use client";

import { Repeat } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { PATHWAYS, type PathwayId } from "@/content/pathways";
import { switchPathway } from "@/lib/actions/pathway";
import { palette, pathwayColors } from "@/lib/design/tokens";
import type { RemapPreview } from "@/lib/domain/remap";
import { cn } from "@/lib/utils";

type Props = { current: PathwayId; previews: Record<PathwayId, RemapPreview> };

export function SwitchPathwayForm({ current, previews }: Props) {
  const [pathwayId, setPathwayId] = useState<PathwayId | "">("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const preview = pathwayId ? previews[pathwayId] : null;
  const target = PATHWAYS.find((p) => p.id === pathwayId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    startTransition(async () => {
      // A successful switch redirects to the plan; anything returned is an error.
      const result = await switchPathway({ pathwayId, reason: reason || undefined });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <FieldSet>
        <FieldLegend className="text-heading-md text-navy-900 font-semibold">
          Where are you headed now?
        </FieldLegend>
        <RadioGroup
          value={pathwayId}
          onValueChange={(v) => setPathwayId(v as PathwayId)}
          className="gap-3"
          aria-invalid={errors.pathwayId ? true : undefined}
        >
          {PATHWAYS.filter((p) => p.id !== current).map(({ id, name, selfDescription }) => (
            <label
              key={id}
              htmlFor={`switch-${id}`}
              className={cn(
                "rounded-card flex min-h-16 cursor-pointer items-center gap-4 border-2 bg-white px-4 py-3 transition-colors",
                pathwayId === id
                  ? "border-navy-900 bg-area-career"
                  : "border-border hover:border-navy-900/40",
              )}
              style={{ borderLeft: `8px solid ${palette[pathwayColors[id].fill]}` }}
            >
              <RadioGroupItem id={`switch-${id}`} value={id} />
              <span>
                <span className="text-navy-900 block font-semibold">{name}</span>
                <span className="text-ink-600 block text-sm">{selfDescription}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
        {errors.pathwayId && <FieldError>{errors.pathwayId[0]}</FieldError>}
      </FieldSet>

      {preview && target && (
        <section
          aria-live="polite"
          aria-label="What happens to your work"
          className="rounded-card bg-success-50 p-5"
        >
          <p className="text-navy-900 font-semibold">Nothing you&apos;ve done is lost.</p>
          <ul className="text-body-sm text-ink-900 mt-2 flex flex-col gap-1">
            <li>
              <strong>{preview.kept}</strong> completed{" "}
              {preview.kept === 1 ? "output stays" : "outputs stay"} in your Launch File.
            </li>
            <li>
              <strong>{preview.credited}</strong> of {preview.total} {target.name} steps already
              count as done.
            </li>
            <li>
              <strong>{preview.remaining}</strong> steps left on your new plan.
            </li>
          </ul>
        </section>
      )}

      <Field>
        <FieldLabel htmlFor="switch-reason">What changed? (optional)</FieldLabel>
        <Textarea
          id="switch-reason"
          value={reason}
          maxLength={300}
          onChange={(e) => setReason(e.target.value)}
          placeholder="My start date moved, so I'm searching again."
          aria-invalid={errors.reason ? true : undefined}
        />
        {errors.reason && <FieldError>{errors.reason[0]}</FieldError>}
      </Field>

      {formError && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={!pathwayId || pending}>
        <Repeat aria-hidden="true" />
        {pending ? "Switching…" : target ? `Switch to ${target.name}` : "Choose a pathway"}
      </Button>
    </form>
  );
}
