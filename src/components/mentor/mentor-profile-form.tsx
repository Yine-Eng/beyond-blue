"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JOURNEY_TAGS } from "@/content/journey-tags";
import { PATHWAYS } from "@/content/pathways";
import { updateMentorProfile } from "@/lib/actions/mentor";

type MentorProfileFormProps = {
  initial: {
    displayName: string;
    roleTitle: string;
    employer: string;
    industry: string;
    city: string;
    gradSchool: string;
    bio: string;
    pathways: string[];
    journeyTags: string[];
    capacity: number;
    isAvailable: boolean;
  };
};

const TEXT_FIELDS = [
  { name: "displayName", label: "Name", required: true },
  { name: "roleTitle", label: "Role", required: true },
  { name: "employer", label: "Employer" },
  { name: "industry", label: "Industry" },
  { name: "city", label: "City" },
  { name: "gradSchool", label: "Graduate school" },
] as const;

const slug = (value: string) => value.replace(/\W+/g, "-").toLowerCase();

function CheckboxGroup({
  legend,
  name,
  options,
  checked,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  checked: string[];
}) {
  return (
    <FieldSet>
      <FieldLegend>{legend}</FieldLegend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(({ value, label }) => {
          const id = `${name}-${slug(value)}`;
          return (
            <label
              key={value}
              htmlFor={id}
              className="flex min-h-11 items-center gap-3 rounded-lg border-2 bg-white px-3 text-sm font-medium"
            >
              <Checkbox
                id={id}
                name={name}
                value={value}
                defaultChecked={checked.includes(value)}
              />
              {label}
            </label>
          );
        })}
      </div>
    </FieldSet>
  );
}

export function MentorProfileForm({ initial }: MentorProfileFormProps) {
  const [state, action, pending] = useActionState(updateMentorProfile, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {TEXT_FIELDS.map(({ name, label, ...rest }) => (
        <Field key={name} data-invalid={errors[name] ? true : undefined}>
          <FieldLabel htmlFor={name}>
            {label}
            {!("required" in rest) && <span className="text-ink-600 font-normal"> (optional)</span>}
          </FieldLabel>
          <Input id={name} name={name} defaultValue={initial[name]} {...rest} />
          {errors[name] && <FieldError>{errors[name][0]}</FieldError>}
        </Field>
      ))}
      <Field>
        <FieldLabel htmlFor="bio">
          About you <span className="text-ink-600 font-normal">(optional)</span>
        </FieldLabel>
        <Textarea id="bio" name="bio" maxLength={600} rows={4} defaultValue={initial.bio} />
      </Field>

      <CheckboxGroup
        legend="Pathways you can help with"
        name="pathways"
        options={PATHWAYS.map((p) => ({ value: p.id, label: p.name }))}
        checked={initial.pathways}
      />
      <CheckboxGroup
        legend="Journey tags to show students (optional)"
        name="journeyTags"
        options={JOURNEY_TAGS.map((t) => ({ value: t, label: t }))}
        checked={initial.journeyTags}
      />

      <Field data-invalid={errors.capacity ? true : undefined}>
        <FieldLabel htmlFor="capacity">Maximum active mentees</FieldLabel>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={0}
          max={20}
          defaultValue={initial.capacity}
          className="max-w-32"
        />
        {errors.capacity && <FieldError>{errors.capacity[0]}</FieldError>}
      </Field>
      <label
        htmlFor="isAvailable"
        className="flex min-h-11 items-center gap-3 rounded-lg border-2 bg-white px-3 text-sm font-medium"
      >
        <Checkbox id="isAvailable" name="isAvailable" defaultChecked={initial.isAvailable} />
        Accepting new requests
      </label>

      {state && (
        <p
          role={state.ok ? "status" : "alert"}
          className={
            state.ok ? "text-sm font-semibold text-green-700" : "text-danger text-sm font-semibold"
          }
        >
          {state.ok ? "Profile saved." : state.error}
        </p>
      )}
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
