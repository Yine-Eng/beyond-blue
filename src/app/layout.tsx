import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Beyond Blue",
    template: "%s · Beyond Blue",
  },
  description:
    "From Countdown to Launchpad: a 100-day transition experience for every graduating senior at Bluefield State University.",
  applicationName: "Beyond Blue",
  authors: [{ name: "Team Northbound" }],
  keywords: ["Bluefield State University", "graduation", "career readiness", "HBCU", "transition"],
  openGraph: {
    type: "website",
    siteName: "Beyond Blue",
    title: "Beyond Blue: What happens after graduation?",
    description:
      "A university-wide 100-day transition experience: one shared core curriculum, five personalized pathways, real-world assignments, human mentorship and targeted support.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beyond Blue: What happens after graduation?",
    description: "From Countdown to Launchpad. Try the demo as Veronica.",
  },
};

export const viewport: Viewport = {
  themeColor: "#174380",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full antialiased", fontVariables)}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
