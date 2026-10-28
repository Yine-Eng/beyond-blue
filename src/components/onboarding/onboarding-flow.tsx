"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { JOURNEY_TAGS, PREFER_NOT_TO_SAY } from "@/content/journey-tags";
import { PATHWAYS } from "@/content/pathways";
import { createPlan } from "@/lib/actions/onboarding";
import { palette, pathwayColors } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";
import type { OnboardingInput } from "@/lib/validation/onboarding";

const DRAFT_KEY = "bb:onboarding-draft";
const STEPS = ["Where are you headed?", "What describes your journey?", "A few basics"] as const;

type Draft = Required<Pick<OnboardingInput, "journeyTags">> & Omit<OnboardingInput, "journeyTags">;

function loadDraft(defaultName: string): Draft {
  const empty: Draft = { pathwayId: "", journeyTags: [], preferredName: defaultName };
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Draft>) } : empty;
  } catch {
    return empty;
  }
}

export function OnboardingFlow({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    pathwayId: "",
    journeyTags: [],
    preferredName: defaultName,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const loaded = useRef(false);

  // Restore the draft after hydration (sessionStorage isn't available on the server).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage
    setDraft(loadDraft(defaultName));
    loaded.current = true;
  }, [defaultName]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage can be unavailable (private mode); the flow still works without it.
    }
  }, [draft]);

  const goTo = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const toggleTag = (tag: string, checked: boolean) => {
    if (tag === PREFER_NOT_TO_SAY)
      return update({ journeyTags: checked ? [PREFER_NOT_TO_SAY] : [] });
    const rest = draft.journeyTags.filter((t) => t !== tag && t !== PREFER_NOT_TO_SAY);
    update({ journeyTags: checked ? [...rest, tag] : rest });
  };

  const submit = () => {
    setFormError(undefined);
    startTransition(async () => {
      const result = await createPlan(draft);
      // A successful save redirects to the plan; anything returned is an error.
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        if (result.fieldErrors?.pathwayId) goTo(0);
      } else {
        sessionStorage.removeItem(DRAFT_KEY);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
          Step {step + 1} of {STEPS.length}
        </p>
        <ol aria-hidden="true" className="mt-2 flex gap-2">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= step ? "bg-navy-900" : "bg-cream-200",
              )}
            />
          ))}
        </ol>
        <p className="text-heading-lg text-navy-900 mt-5 font-serif font-bold">
          Build Your Beyond Blue
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-hand text-navy-900 mt-1 text-3xl outline-none"
        >
          {STEPS[step]}
        </h1>
      </div>

      {step === 0 && (
        <FieldSet>
          <FieldLegend className="sr-only">Choose your pathway</FieldLegend>
          <RadioGroup
            value={draft.pathwayId}
            onValueChange={(pathwayId) => update({ pathwayId })}
            className="gap-3"
            aria-invalid={errors.pathwayId ? true : undefined}
          >
            {PATHWAYS.map(({ id, name, selfDescription }) => {
              const selected = draft.pathwayId === id;
              return (
                <label
                  key={id}
                  htmlFor={`pathway-${id}`}
                  className={cn(
                    "rounded-card flex min-h-16 cursor-pointer items-center gap-4 border-2 bg-white px-4 py-3 transition-colors",
                    selected
                      ? "border-navy-900 bg-area-career"
                      : "border-border hover:border-navy-900/40",
                  )}
                  style={{ borderLeft: `8px solid ${palette[pathwayColors[id].fill]}` }}
                >
                  <RadioGroupItem id={`pathway-${id}`} value={id} />
                  <span>
                    <span className="text-navy-900 block font-semibold">{name}</span>
                    <span className="text-ink-600 block text-sm">{selfDescription}</span>
                  </span>
                </label>
              );
            })}
          </RadioGroup>
          {errors.pathwayId && <FieldError>{errors.pathwayId[0]}</FieldError>}
        </FieldSet>
      )}

      {step === 1 && (
        <FieldSet>
          <FieldLegend className="sr-only">Select everything that applies</FieldLegend>
          <FieldDescription>
            Select everything that applies. We use this to match you with alumni and resources.
            It&apos;s never shown to mentors without your permission.
          </FieldDescription>
          <div className="grid gap-2 sm:grid-cols-2">
            {[...JOURNEY_TAGS, PREFER_NOT_TO_SAY].map((tag) => {
              const id = `tag-${tag.replace(/\W+/g, "-").toLowerCase()}`;
              const checked = draft.journeyTags.includes(tag);
              return (
                <label
                  key={tag}
                  htmlFor={id}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 bg-white px-3 py-2 text-sm font-medium",
                    checked ? "border-navy-900 bg-area-career" : "border-border",
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(v) => toggleTag(tag, v === true)}
                  />
                  {tag}
                </label>
              );
            })}
          </div>
        </FieldSet>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Field data-invalid={errors.preferredName ? true : undefined}>
            <FieldLabel htmlFor="preferredName">What should we call you?</FieldLabel>
            <Input
              id="preferredName"
              autoComplete="given-name"
              value={draft.preferredName}
              onChange={(e) => update({ preferredName: e.target.value })}
              aria-invalid={errors.preferredName ? true : undefined}
              required
            />
            {errors.preferredName && <FieldError>{errors.preferredName[0]}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="major">Major (optional)</FieldLabel>
            <Input
              id="major"
              value={draft.major ?? ""}
              onChange={(e) => update({ major: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="targetCity">Target city (optional)</FieldLabel>
            <Input
              id="targetCity"
              autoComplete="address-level2"
              placeholder="Atlanta, GA"
              value={draft.targetCity ?? ""}
              onChange={(e) => update({ targetCity: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="destinationRole">
              Destination role or program (optional)
            </FieldLabel>
            <Input
              id="destinationRole"
              placeholder="Program Manager"
              value={draft.destinationRole ?? ""}
              onChange={(e) => update({ destinationRole: e.target.value })}
            />
          </Field>
        </div>
      )}

      {formError && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {formError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => goTo(step - 1)}>
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => goTo(step + 1)}
            disabled={step === 0 && !draft.pathwayId}
          >
            Continue <ArrowRight aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" variant="accent" size="lg" onClick={submit} disabled={pending}>
            {pending ? "Creating your plan…" : "Create My 100-Day Plan →"}
          </Button>
        )}
      </div>
    </div>
  );
}
