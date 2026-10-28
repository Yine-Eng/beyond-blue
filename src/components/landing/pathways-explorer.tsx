"use client";

import { Briefcase, Compass, GraduationCap, type LucideIcon, Rocket, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PATHWAYS, type PathwayId } from "@/content/pathways";
import { palette, pathwayColors } from "@/lib/design/tokens";

const ICONS: Record<PathwayId, LucideIcon> = {
  hired: Briefcase,
  job_search: Search,
  higher_ed: GraduationCap,
  entrepreneurship: Rocket,
  still_deciding: Compass,
};

/** Five pathways as accessible tabs (arrow keys move between them). */
export function PathwaysExplorer() {
  return (
    <Tabs defaultValue="hired" className="gap-6">
      <TabsList
        aria-label="Pathways"
        className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0"
      >
        {PATHWAYS.map(({ id, name }) => {
          const Icon = ICONS[id];
          const { fill, onFill } = pathwayColors[id];
          return (
            <TabsTrigger
              key={id}
              value={id}
              style={{
                ["--fill" as string]: palette[fill],
                ["--on-fill" as string]: palette[onFill],
              }}
              className="text-navy-900 h-11 flex-none rounded-full border-2 border-(--fill) bg-white px-4 text-base font-semibold data-[state=active]:bg-(--fill) data-[state=active]:text-(--on-fill)"
            >
              <Icon aria-hidden="true" className="size-4" />
              {name}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {PATHWAYS.map(({ id, name, selfDescription, focus }) => {
        const Icon = ICONS[id];
        const { fill, onFill } = pathwayColors[id];
        return (
          <TabsContent key={id} value={id}>
            <div
              className="shadow-paper rounded-card p-6 sm:p-8"
              style={{ background: palette[fill], color: palette[onFill] }}
            >
              <div className="flex items-start gap-4">
                <Icon aria-hidden="true" className="size-10 shrink-0" />
                <div>
                  <h3 className="font-marker text-display-md uppercase">{name}</h3>
                  <p className="text-heading-md mt-1">{selfDescription}</p>
                </div>
              </div>
              <ul className="text-ink-900 mt-6 grid gap-3 rounded-lg bg-white/90 p-5 sm:grid-cols-3">
                {focus.map((item) => (
                  <li key={item} className="font-hand flex items-center gap-2 text-xl">
                    <span aria-hidden="true">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
