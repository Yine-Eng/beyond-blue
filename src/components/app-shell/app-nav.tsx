"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

/** Fixed bottom tab bar for phones and tablets (below 1024 px). */
export function BottomNavView({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-caption flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2",
                  active ? "text-navy-900 font-bold" : "text-ink-600 font-medium",
                )}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sidebar navigation for desktop (1024 px and up). */
export function SidebarNavView({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-body rounded-button flex min-h-11 items-center gap-3 px-4 py-2 transition-colors",
                  active
                    ? "bg-cream-50 text-navy-900 font-semibold"
                    : "text-cream-50 hover:bg-white/10",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// The current URL is request data on dynamic routes, so these sit behind <Suspense> in the shell
// (with the views above, minus the active highlight, as the static fallback).
export function BottomNav() {
  return <BottomNavView pathname={usePathname()} />;
}

export function SidebarNav() {
  return <SidebarNavView pathname={usePathname()} />;
}
