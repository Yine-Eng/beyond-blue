import { SiteHeader } from "@/components/landing/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#story"
        className="bg-navy-900 sr-only z-50 rounded px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      {/* Flat royal blue keeps paint cheap on a long page; the sunburst sits behind the hero only. */}
      <div className="bg-royal-700 text-ink-900 flex-1">
        <main id="story" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
