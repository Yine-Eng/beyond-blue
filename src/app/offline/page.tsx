import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/wordmark";
import {
  BurstBackground,
  MarkerHeading,
  NotebookLines,
  PaperCard,
  Tape,
} from "@/components/scrapbook";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

/** Shown by the service worker when a page can't load without a connection. */
export default function OfflinePage() {
  return (
    <BurstBackground className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <Wordmark />
      <PaperCard variant="pinned" tilt={-1.5} className="w-full max-w-md p-0">
        <Tape position="top-left" />
        <NotebookLines className="text-ink-900 rounded-[inherit] px-6 py-8">
          <MarkerHeading as="h1" underline className="text-navy-900 text-3xl">
            You&apos;re offline
          </MarkerHeading>
          <p className="mt-6 leading-8">
            Beyond Blue needs a connection to load your plan. Everything you&apos;ve saved is safe.
            It will be right here when you&apos;re back online.
          </p>
          <div className="mt-6">
            <RetryButton />
          </div>
        </NotebookLines>
      </PaperCard>
    </BurstBackground>
  );
}
