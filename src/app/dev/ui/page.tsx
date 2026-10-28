import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import {
  BurstBackground,
  Doodle,
  type DoodleName,
  MarkerHeading,
  NotebookLines,
  PaperCard,
  Sticker,
  Tape,
} from "@/components/scrapbook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { contrastRatio } from "@/lib/design/contrast";
import { type PaletteToken, areaColors, palette, pathwayColors } from "@/lib/design/tokens";
import { DisclosureDemo, FormDemo } from "./interactive-demos";

export const metadata: Metadata = {
  title: "UI kit",
  robots: { index: false, follow: false },
};

// Developer page. Hidden in production unless explicitly enabled.
const enabled =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_UI_KIT === "true";

const DOODLES: DoodleName[] = ["arrow", "star", "circle", "underline", "squiggle", "sparkle"];

const TYPE_SCALE = [
  ["text-display-xl font-script", "Beyond Blue"],
  ["text-display-lg font-marker", "87"],
  ["text-display-md font-marker uppercase", "Veronica starts her path."],
  ["text-heading-xl font-serif font-bold uppercase", "Built to Last"],
  ["text-heading-serif font-serif", "How Beyond Blue Works"],
  ["text-heading-lg font-serif font-bold", "87 Days to Graduation"],
  ["text-heading-md font-semibold", "Financial Readiness"],
  ["text-body-lg", "A 100-day transition experience for every graduating senior."],
  ["text-body", "Build your first 90-day budget and save it to your Launch File."],
  ["text-body-sm font-medium", "Due Day 70 · Form output"],
  ["text-caption font-semibold uppercase tracking-wide", "Career Readiness"],
  ["text-2xl font-hand", "Selected Pathway: Hired"],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`kit-${title}`} className="flex flex-col gap-4">
      <h2
        id={`kit-${title}`}
        className="text-heading-lg text-navy-900 border-b pb-2 font-serif font-bold"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({ token }: { token: PaletteToken }) {
  const hex = palette[token];
  const onWhite = contrastRatio(hex, palette.white);
  const onInk = contrastRatio(hex, palette["ink-900"]);
  const textColor = onWhite >= onInk ? palette.white : palette["ink-900"];
  return (
    <li className="overflow-hidden rounded-lg border bg-white">
      <div
        className="h-16 px-3 py-2 text-xs font-semibold"
        style={{ background: hex, color: textColor }}
      >
        Aa {Math.max(onWhite, onInk).toFixed(1)}
      </div>
      <div className="px-3 py-2">
        <p className="text-body-sm font-semibold">{token}</p>
        <p className="text-caption text-ink-600 uppercase">{hex}</p>
      </div>
    </li>
  );
}

export default function UiKitPage() {
  if (!enabled) notFound();

  return (
    <main id="main" className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-xl text-navy-900 font-serif font-bold">Beyond Blue UI kit</h1>
        <p className="text-ink-600 max-w-prose">
          Every token, type style and component state. Source of truth:{" "}
          <code>src/lib/design/tokens.ts</code> and <code>docs/design-system.md</code>.
        </p>
      </header>

      <Section title="Colour">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(palette) as PaletteToken[]).map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </ul>
        <h3 className="text-heading-md">Readiness areas</h3>
        <ul className="grid gap-3 sm:grid-cols-5">
          {Object.entries(areaColors).map(([area, { tint, ink }]) => (
            <li key={area} className="rounded-lg p-4" style={{ background: palette[tint] }}>
              <p className="text-navy-900 font-semibold capitalize">{area}</p>
              <p className="text-body-sm font-semibold" style={{ color: palette[ink] }}>
                3 of 6 complete
              </p>
            </li>
          ))}
        </ul>
        <h3 className="text-heading-md">Pathway chips</h3>
        <ul className="flex flex-wrap gap-2">
          {Object.entries(pathwayColors).map(([pathway, { fill, onFill }]) => (
            <li
              key={pathway}
              className="rounded-full px-3 py-1 text-sm font-semibold"
              style={{ background: palette[fill], color: palette[onFill] }}
            >
              {pathway.replace("_", " ")}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typography">
        <ul className="flex flex-col gap-4">
          {TYPE_SCALE.map(([classes, sample]) => (
            <li key={classes} className="flex flex-col gap-1">
              <code className="text-caption text-ink-600">{classes}</code>
              <span className={`text-navy-900 ${classes}`}>{sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>View My Beyond Blue →</Button>
          <Button variant="accent">Try the demo as Veronica</Button>
          <Button variant="secondary">Connect</Button>
          <Button variant="outline">Edit profile</Button>
          <Button variant="ghost">Skip for now</Button>
          <Button variant="link">Read the FAQ</Button>
          <Button variant="destructive">Withdraw request</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default (44 px)</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Forms">
        <FormDemo />
      </Section>

      <Section title="Feedback and status">
        <div className="flex flex-wrap gap-2">
          <Badge>Active</Badge>
          <Badge variant="secondary">Upcoming</Badge>
          <Badge variant="outline">Verified</Badge>
          <Badge variant="destructive">Behind</Badge>
        </div>
        <div className="flex max-w-md flex-col gap-2">
          <p className="text-body-sm font-medium">12 of 30 steps complete</p>
          <Progress value={40} aria-label="12 of 30 steps complete" />
        </div>
        <div className="flex max-w-md flex-col gap-2" aria-hidden="true">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Section>

      <Section title="Disclosure">
        <DisclosureDemo />
      </Section>

      <Section title="Scrapbook kit">
        <BurstBackground className="flex flex-col gap-10 rounded-[var(--radius-card)] p-6 sm:p-10">
          <div className="bg-navy-800 -rotate-1 self-start px-5 py-2">
            <Wordmark className="text-5xl" />
          </div>
          <div className="grid gap-10 sm:grid-cols-2">
            <PaperCard variant="clean">
              <p className="font-semibold">clean</p>
              <p className="text-ink-600">App-screen card with a paper shadow.</p>
            </PaperCard>
            <PaperCard variant="pinned" tilt={-2}>
              <Tape position="top-center" />
              <p className="font-semibold">pinned</p>
              <p className="text-ink-600">Slight tilt, flattened under reduced motion.</p>
            </PaperCard>
            <PaperCard variant="torn">
              <Tape position="top-left" tone="blue" />
              <p className="font-semibold">torn</p>
              <p className="text-ink-600">Ripped top and bottom edges.</p>
            </PaperCard>
            <PaperCard variant="spiral">
              <p className="font-semibold">spiral</p>
              <p className="text-ink-600">Notebook binding down the left.</p>
            </PaperCard>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Sticker>Selected Pathway:</Sticker>
            <Sticker tone="blue" tilt={2}>
              Career Readiness
            </Sticker>
            <Sticker tone="pink" tilt={-1}>
              Network & Mentorship
            </Sticker>
            <Sticker tone="cream" tilt={3}>
              68%
            </Sticker>
          </div>
          <ul className="text-gold-400 flex flex-wrap items-center gap-6">
            {DOODLES.map((name) => (
              <li key={name} className="flex flex-col items-center gap-1">
                <Doodle name={name} animated className="h-10 w-20" />
                <span className="text-caption text-cream-50">{name}</span>
              </li>
            ))}
          </ul>
        </BurstBackground>
        <PaperCard variant="torn" className="mt-4">
          <MarkerHeading as="h3" underline animated className="text-navy-900">
            Veronica starts her path.
          </MarkerHeading>
        </PaperCard>
        <NotebookLines className="rounded-[var(--radius-card)] px-6 py-8">
          <p className="font-hand text-navy-900 text-2xl">NotebookLines</p>
          <p className="text-ink-600">Ruled paper for empty states and the Detour builder.</p>
        </NotebookLines>
      </Section>
    </main>
  );
}
