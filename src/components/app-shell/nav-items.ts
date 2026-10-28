import { House, ListChecks, type LucideIcon, UserRound, UsersRound } from "lucide-react";

export type NavItem = {
  href: "/home" | "/plan" | "/network" | "/profile";
  label: string;
  icon: LucideIcon;
};

/** Home · Plan · Network · Profile, matching the slide 7 mockups. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/home", label: "Home", icon: House },
  { href: "/plan", label: "Plan", icon: ListChecks },
  { href: "/network", label: "Network", icon: UsersRound },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** A nav item is active on its own route and any nested route (e.g. /plan/financial). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
