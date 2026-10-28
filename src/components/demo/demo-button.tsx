"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { startDemo } from "@/lib/actions/demo";
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
