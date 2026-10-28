import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { BottomNav, SidebarNav } from "./app-nav";

/** Authenticated app frame: sidebar on desktop, header + bottom tabs on phones. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1">
      <a
        href="#main"
        className="bg-navy-900 sr-only z-50 rounded px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="bg-burst sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 px-4 py-6 lg:flex">
        <Link href="/home" className="bg-navy-800 -rotate-1 self-start rounded-sm px-4 py-2">
          <Wordmark />
        </Link>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b bg-white px-4 py-3 lg:hidden">
          <Link href="/home" className="inline-block">
            <Wordmark variant="serif" />
          </Link>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-10 lg:pb-12"
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
