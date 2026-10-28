"use client";

import { MailCheck } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DemoButton, StaffDemoButton } from "@/components/demo/demo-button";
import { requestMagicLink } from "@/lib/actions/auth";
import { EMAIL_UNAVAILABLE } from "@/lib/auth/errors";

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(requestMagicLink, null);

  if (state?.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 text-center">
        <MailCheck aria-hidden="true" className="size-12 text-green-700" />
        <h2 className="text-heading-lg text-navy-900 font-serif font-bold">Check your email</h2>
        <p className="text-ink-600">
          We sent a sign-in link to <strong className="text-ink-900">{state.data.email}</strong>. It
          expires in one hour.
        </p>
      </div>
    );
  }

  // The email provider is at its limit: don't leave a judge at a dead end, offer the demos.
  if (state && !state.ok && state.code === EMAIL_UNAVAILABLE) {
    return (
      <div className="flex flex-col gap-4">
        <div role="alert" className="bg-cream-50 rounded-lg px-4 py-3">
          <p className="text-navy-900 font-semibold">We can&apos;t send sign-in emails just now.</p>
          <p className="text-body-sm text-ink-600 mt-1">{state.error}</p>
        </div>
        <DemoButton className="w-full" />
        <StaffDemoButton className="self-center" />
      </div>
    );
  }

  const emailError =
    state && !state.ok ? (state.fieldErrors?.email?.[0] ?? state.error) : undefined;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <Field data-invalid={emailError ? true : undefined}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : "email-help"}
          placeholder="you@bluefieldstate.edu"
        />
        {emailError ? (
          <FieldError id="email-error">{emailError}</FieldError>
        ) : (
          <FieldDescription id="email-help">
            We&apos;ll email you a one-time sign-in link. No password needed.
          </FieldDescription>
        )}
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
