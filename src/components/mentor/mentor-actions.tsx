"use client";

import { BadgeCheck, Check, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { logConversation, respondToConnection, verifyOutput } from "@/lib/actions/mentor";

export function RespondButtons({ connectionId, name }: { connectionId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const respond = (accept: boolean) =>
    startTransition(async () => {
      const result = await respondToConnection({ connectionId, accept });
      if (!result.ok) toast.error(result.error);
      else toast.success(accept ? `You're now connected with ${name}.` : "Request declined.");
    });
  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => respond(true)}>
        <Check aria-hidden="true" /> Accept
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => respond(false)}>
        <X aria-hidden="true" /> Decline
      </Button>
    </div>
  );
}

export function VerifyButton({ completionId, title }: { completionId: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      aria-label={`Verify ${title}`}
      onClick={() =>
        startTransition(async () => {
          const result = await verifyOutput(completionId);
          if (!result.ok) toast.error(result.error);
          else toast.success("Marked as verified.");
        })
      }
    >
      <BadgeCheck aria-hidden="true" /> Verify
    </Button>
  );
}

export function ConversationForm({ connectionId }: { connectionId: string }) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();
  const id = (name: string) => `${name}-${connectionId}`;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    startTransition(async () => {
      const result = await logConversation({ connectionId, ...data });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setErrors({});
      form.reset();
      toast.success("Conversation logged.");
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
      <Field data-invalid={errors.metOn ? true : undefined}>
        <FieldLabel htmlFor={id("metOn")}>Date</FieldLabel>
        <Input id={id("metOn")} name="metOn" type="date" required />
        {errors.metOn && <FieldError>{errors.metOn[0]}</FieldError>}
      </Field>
      <Field data-invalid={errors.topic ? true : undefined}>
        <FieldLabel htmlFor={id("topic")}>Topic</FieldLabel>
        <Input id={id("topic")} name="topic" maxLength={120} required />
        {errors.topic && <FieldError>{errors.topic[0]}</FieldError>}
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor={id("notes")}>
          Notes <span className="text-ink-600 font-normal">(optional)</span>
        </FieldLabel>
        <Textarea id={id("notes")} name="notes" maxLength={2000} rows={3} />
      </Field>
      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Log conversation"}
        </Button>
      </div>
    </form>
  );
}
