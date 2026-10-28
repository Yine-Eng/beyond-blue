import { BurstBackground, Doodle, PaperCard, Sticker, Tape } from "@/components/scrapbook";

// Holding page until the story site lands in M1.
export default function HomePage() {
  return (
    <BurstBackground className="flex flex-1 items-center justify-center px-4 py-16">
      <main className="w-full max-w-2xl">
        <PaperCard variant="torn" className="px-6 py-10 text-center sm:px-10">
          <Tape position="top-left" />
          <Tape position="top-right" tone="blue" />
          <Doodle
            name="star"
            className="text-gold-500 absolute top-4 right-6 hidden size-10 sm:block"
          />
          <div className="bg-navy-800 mx-auto inline-block -rotate-1 px-6 py-3">
            <h1 className="font-script text-display-xl text-cream-100">
              Beyond <span className="text-blue-300">Blue</span>
            </h1>
          </div>
          <p className="font-hand text-navy-900 mt-6 text-2xl sm:text-3xl">
            What happens after graduation?
          </p>
          <p className="text-body-lg text-ink-600 mx-auto mt-4 max-w-md">
            From Countdown to Launchpad. A 100-day transition experience for every graduating senior
            at Bluefield State University.
          </p>
          <Sticker className="mt-6">Coming soon · Team Northbound</Sticker>
        </PaperCard>
      </main>
    </BurstBackground>
  );
}
