"use client";

import { Button } from "@/components/ui/button";
import { PlaceholderPanel } from "@/components/states/placeholder-panel";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <PlaceholderPanel title="Something went sideways.">
        <p>We couldn&apos;t load this page. Your progress is safe.</p>
        <Button className="mt-4" onClick={reset}>
          Try again
        </Button>
      </PlaceholderPanel>
    </div>
  );
}
