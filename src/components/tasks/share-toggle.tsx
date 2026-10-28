"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setOutputShared } from "@/lib/actions/tasks";

/** Students choose which outputs their accepted mentors can see (and verify). */
export function ShareToggle({ taskId, initial }: { taskId: string; initial: boolean }) {
  const [shared, setShared] = useState(initial);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex min-h-11 items-center gap-3">
      <Switch
        id={`share-${taskId}`}
        checked={shared}
        disabled={pending}
        onCheckedChange={(next) =>
          startTransition(async () => {
            setShared(next);
            const result = await setOutputShared({ taskId, shared: next });
            if (!result.ok) {
              setShared(!next);
              toast.error(result.error);
            }
          })
        }
      />
      <label htmlFor={`share-${taskId}`} className="text-body-sm text-ink-900">
        Share with my mentors so they can give feedback and verify it
      </label>
    </div>
  );
}
