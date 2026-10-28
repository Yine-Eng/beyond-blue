"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { JOURNEY_TAGS } from "@/content/journey-tags";
import { updateProfile } from "@/lib/actions/profile";

type ProfileFormProps = {
  initial: {
    preferredName: string;
    fullName: string;
    major: string;
    destinationRole: string;
    targetCity: string;
    journeyTags: string[];
  };
};

const TEXT_FIELDS = [
  { name: "preferredName", label: "Preferred name", autoComplete: "given-name", required: true },
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "major", label: "Major" },
  { name: "destinationRole", label: "Destination role or program" },
  { name: "targetCity", label: "Target city", autoComplete: "address-level2" },
] as const;

export function ProfileForm({ initial }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {TEXT_FIELDS.map(({ name, label, ...rest }) => (
        <Field key={name} data-invalid={errors[name] ? true : undefined}>
          <FieldLabel htmlFor={name}>
            {label}
            {!("required" in rest) && <span className="text-ink-600 font-normal"> (optional)</span>}
          </FieldLabel>
          <Input
            id={name}
            name={name}
            defaultValue={initial[name]}
            aria-invalid={errors[name] ? true : undefined}
            {...rest}
          />
          {errors[name] && <FieldError>{errors[name][0]}</FieldError>}
        </Field>
      ))}

      <FieldSet>
        <FieldLegend>My journey</FieldLegend>
        <div className="grid gap-2 sm:grid-cols-2">
          {JOURNEY_TAGS.map((tag) => {
            const id = `tag-${tag.replace(/\W+/g, "-").toLowerCase()}`;
            return (
              <label
                key={tag}
                htmlFor={id}
                className="flex min-h-11 items-center gap-3 rounded-lg border-2 bg-white px-3 text-sm font-medium"
              >
                <Checkbox
                  id={id}
                  name="journeyTags"
                  value={tag}
                  defaultChecked={initial.journeyTags.includes(tag)}
                />
                {tag}
              </label>
            );
          })}
        </div>
      </FieldSet>

      {state && !state.ok && (
        <p role="alert" className="text-danger text-sm font-semibold">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/profile">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
