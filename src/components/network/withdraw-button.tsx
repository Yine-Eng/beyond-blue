"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { withdrawConnection } from "@/lib/actions/network";

export function WithdrawButton({ connectionId, label }: { connectionId: string; label: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      aria-label={label}
      onClick={() =>
        startTransition(async () => {
          const result = await withdrawConnection(connectionId);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      {pending ? "Withdrawing…" : "Withdraw"}
    </Button>
  );
}
