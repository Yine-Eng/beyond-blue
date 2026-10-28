import { SiteHeader } from "@/components/landing/site-header";
import { MotionProvider } from "@/components/motion/motion-provider";
import { BurstBackground } from "@/components/scrapbook";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <MotionProvider>
      <a
        href="#story"
        className="bg-navy-900 sr-only z-50 rounded px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <BurstBackground className="text-ink-900 flex-1">
        <main id="story" tabIndex={-1}>
          {children}
        </main>
      </BurstBackground>
    </MotionProvider>
  );
}
