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
      {/* overflow-x-clip: tape and doodles overhang their cards; clip here, not on <body>, because
          body overflow propagates to the viewport, where mobile Safari can still pan sideways. */}
      <div className="bg-royal-700 text-ink-900 flex-1 overflow-x-clip">
        <main id="story" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
