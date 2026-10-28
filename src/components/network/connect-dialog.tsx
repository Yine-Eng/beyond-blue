"use client";

import { UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { requestConnection } from "@/lib/actions/network";

type ConnectDialogProps = {
  mentorId: string;
  mentorName: string;
  reason: string;
  disabled?: boolean;
};

/** "Connect" opens a short request: the match reason pre-filled plus an optional note. */
export function ConnectDialog({ mentorId, mentorName, reason, disabled }: ConnectDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const firstName = mentorName.split(" ")[0];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const note = String(new FormData(event.currentTarget).get("note") ?? "");
    setError(undefined);
    startTransition(async () => {
      const result = await requestConnection({ mentorId, note });
      if (!result.ok) {
        setError(result.fieldErrors?.note?.[0] ?? result.error);
        return;
      }
      setOpen(false);
      toast.success(`Request sent to ${firstName}.`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled} aria-label={`Connect with ${mentorName}`}>
          <UserPlus aria-hidden="true" /> Connect
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Connect with {mentorName}</DialogTitle>
            <DialogDescription>
              Why you matched: <strong className="text-navy-900">{reason}</strong>
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={`note-${mentorId}`}>Add a note (optional)</FieldLabel>
            <Textarea
              id={`note-${mentorId}`}
              name="note"
              maxLength={300}
              rows={4}
              defaultValue={`Hi ${firstName}, I'm a Bluefield State senior and would love to hear how you navigated your first year after graduation.`}
            />
            <FieldDescription>Up to 300 characters.</FieldDescription>
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
