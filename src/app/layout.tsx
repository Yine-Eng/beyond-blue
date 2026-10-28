import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Beyond Blue",
    template: "%s · Beyond Blue",
  },
  description:
    "From Countdown to Launchpad: a 100-day transition experience for every graduating senior at Bluefield State University.",
};

export const viewport: Viewport = {
  themeColor: "#123C8C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
