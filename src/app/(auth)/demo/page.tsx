import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DemoButton, StaffDemoButton } from "@/components/demo/demo-button";
import { signOut } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Explore as Veronica" };

const ERRORS: Record<string, string> = {
  busy: "Lots of people are trying the demo right now. Please try again in a few minutes.",
  unavailable: "The demo couldn't start just now. Please try again.",
  "signed-in": "Sign out to try the demo. You're signed in to your own account right now.",
};

async function DemoError({ searchParams }: Pick<PageProps<"/demo">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  if (!message) return null;
  return (
    <div role="alert" className="bg-area-wellness rounded-lg px-4 py-3 text-sm text-pink-700">
      <p className="font-semibold">{message}</p>
      {error === "signed-in" && (
        // Signing out here only ends this browser's session; the demo never replaces a real one.
        <form action={signOut}>
          <button
            type="submit"
            className="mt-1 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
          >
            Sign out
          </button>
        </form>
      )}
    </div>
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
      <div className="bg-cream-50 rounded-lg px-4 py-3">
        <p className="text-navy-900 font-semibold">Program staff or a judge?</p>
        <p className="text-body-sm text-ink-600 mt-1">
          See the cohort dashboard, at-risk students, Day +100 insights and the Last Mile Fund queue
          with a fictional pilot cohort. Nothing is real or saved.
        </p>
        <StaffDemoButton className="mt-1" />
      </div>
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
