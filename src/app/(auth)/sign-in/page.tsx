import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { DEMO_HREF } from "@/content/copy/landing";

export const metadata: Metadata = { title: "Sign in" };

async function SignInContent({ searchParams }: Pick<PageProps<"/sign-in">, "searchParams">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const linkError = params.error === "link";
  return (
    <>
      {linkError && (
        <p
          role="alert"
          className="bg-area-wellness mb-6 rounded-lg px-4 py-3 text-sm font-semibold text-pink-700"
        >
          That sign-in link has expired or was already used. Enter your email for a new one.
        </p>
      )}
      <SignInForm next={next} />
    </>
  );
}

export default function SignInPage(props: PageProps<"/sign-in">) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg text-navy-900 font-serif font-bold">
          Sign in to Beyond Blue
        </h1>
        <p className="text-ink-600 mt-1">Your 100-day plan, progress and network in one place.</p>
      </div>
      <Suspense fallback={<div className="bg-cream-50 h-40 animate-pulse rounded-lg" />}>
        <SignInContent searchParams={props.searchParams} />
      </Suspense>
      <p className="text-body-sm text-ink-600 border-t pt-4">
        Just looking?{" "}
        <Link href={DEMO_HREF} className="font-semibold text-blue-700 underline underline-offset-4">
          Explore the demo as Veronica
        </Link>
        .
      </p>
    </div>
  );
}
