import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DemoButton } from "@/components/demo/demo-button";

export const metadata: Metadata = { title: "Explore as Veronica" };

const ERRORS: Record<string, string> = {
  busy: "Lots of people are trying the demo right now. Please try again in a few minutes.",
  unavailable: "The demo couldn't start just now. Please try again.",
};

async function DemoError({ searchParams }: Pick<PageProps<"/demo">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  if (!message) return null;
  return (
    <p
      role="alert"
      className="bg-area-wellness rounded-lg px-4 py-3 text-sm font-semibold text-pink-700"
    >
      {message}
    </p>
  );
}

/** Landing spot for direct visits to /demo. Starting the demo is always an explicit button press. */
export default function DemoPage(props: PageProps<"/demo">) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-heading-lg text-navy-900 font-serif font-bold">
          Explore Beyond Blue as Veronica
        </h1>
        <p className="text-ink-600 mt-2">
          Veronica is a Bluefield State senior who graduates in 87 days and just accepted a job in
          Atlanta. Step into her plan: no sign-up, nothing to install. Your demo is private to you
          and is deleted after 24 hours.
        </p>
      </div>
      <Suspense fallback={null}>
        <DemoError searchParams={props.searchParams} />
      </Suspense>
      <DemoButton className="w-full" />
      <p className="text-body-sm text-ink-600">
        Ready for your own plan?{" "}
        <Link href="/sign-in" className="font-semibold text-blue-700 underline underline-offset-4">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
