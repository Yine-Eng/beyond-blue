import { Doodle, PaperCard, Tape } from "@/components/scrapbook";
import { Progress } from "@/components/ui/progress";
import type { CountdownStage } from "@/lib/domain/countdown";

type CountdownHeroProps = {
  daysLeft: number;
  stage: CountdownStage;
  completed: number;
  total: number;
};

function headline(daysLeft: number, stage: CountdownStage) {
  switch (stage) {
    case "launchpad":
      return { number: "0", label: "Launch day. You made it!" };
    case "post-graduation":
      return {
        number: `+${-daysLeft}`,
        label: `Day${-daysLeft === 1 ? "" : "s"} since graduation`,
      };
    case "pre-program":
      return { number: String(daysLeft), label: "Days to Graduation · your 100 days start soon" };
    default:
      return {
        number: String(daysLeft),
        label: daysLeft === 1 ? "Day to Graduation" : "Days to Graduation",
      };
  }
}

export function CountdownHero({ daysLeft, stage, completed, total }: CountdownHeroProps) {
  const { number, label } = headline(daysLeft, stage);
  const summary = `${completed} of ${total} steps complete`;
  return (
    <PaperCard variant="torn" className="mt-3">
      <Tape position="top-right" tone="blue" />
      <div className="flex items-end gap-4">
        <p className="font-marker text-display-lg text-navy-900 leading-none">{number}</p>
        <p className="text-heading-md text-navy-900 pb-1 font-serif font-bold uppercase">{label}</p>
        <Doodle name="star" className="text-gold-500 ml-auto hidden size-10 sm:block" />
      </div>
      <div className="mt-5">
        <Progress
          value={total ? (completed / total) * 100 : 0}
          aria-label={summary}
          className="h-3"
        />
        <p className="text-body-sm text-ink-600 mt-2 text-right font-medium">{summary}</p>
      </div>
    </PaperCard>
  );
}
