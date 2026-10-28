import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { DEMO_HREF } from "@/content/copy/landing";

const LINKS = [
  { href: "#pathways", label: "Pathways" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#budget", label: "Budget" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="bg-navy-800 sticky top-[env(safe-area-inset-top,0px)] z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href="/" aria-label="Beyond Blue home" className="shrink-0">
          <Wordmark className="text-2xl sm:text-3xl" />
        </Link>
        <nav aria-label="Story sections" className="hidden md:block">
          <ul className="text-cream-50 flex items-center gap-6 text-sm font-medium">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="underline-offset-4 hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Button asChild variant="accent" size="sm" className="h-10 px-4">
          <Link href={DEMO_HREF}>Try the demo</Link>
        </Button>
      </div>
    </header>
  );
}
