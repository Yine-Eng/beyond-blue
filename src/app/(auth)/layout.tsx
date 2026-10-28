import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { PaperCard, Tape } from "@/components/scrapbook";

/** Sign-in and onboarding: a single sheet of paper on the sunburst. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-burst flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <Link href="/" className="bg-navy-800 mb-8 -rotate-1 px-5 py-2" aria-label="Beyond Blue home">
        <Wordmark className="text-3xl" />
      </Link>
      <main className="w-full max-w-xl">
        <PaperCard variant="clean" className="relative px-6 py-8 sm:px-10 sm:py-10">
          <Tape position="top-center" tone="blue" />
          {children}
        </PaperCard>
      </main>
    </div>
  );
}
