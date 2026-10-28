"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { startDemo, startStaffDemo } from "@/lib/actions/demo";
import { cn } from "@/lib/utils";

type DemoButtonProps = {
  label?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  formClassName?: string;
};

function SubmitButton({ label, size, className }: Omit<DemoButtonProps, "formClassName">) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size={size} disabled={pending} className={className}>
      {pending ? "Opening Veronica's plan…" : label}
    </Button>
  );
}

/** "Try the demo as Veronica": a POST form, so link prefetching can never start sessions. */
export function DemoButton({
  label = "Try the demo as Veronica →",
  size = "lg",
  className,
  formClassName,
}: DemoButtonProps) {
  return (
    <form action={startDemo} className={cn("contents", formClassName)}>
      <SubmitButton label={label} size={size} className={className} />
    </form>
  );
}

function StaffSubmit({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex min-h-11 items-center font-semibold text-blue-700 underline underline-offset-4 disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Opening the staff view…" : label}
    </button>
  );
}

/** "View as staff (demo)": the staff dashboard with fictional data only. Also a POST form. */
export function StaffDemoButton({
  label = "View as staff (demo) →",
  className,
  formClassName,
}: {
  label?: string;
  className?: string;
  formClassName?: string;
}) {
  return (
    <form action={startStaffDemo} className={formClassName}>
      <StaffSubmit label={label} className={className} />
    </form>
  );
}
