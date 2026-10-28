import { READINESS_AREAS } from "../readiness-areas";
import { entrepreneurship } from "./entrepreneurship";
import { higherEd } from "./higher-ed";
import { hired } from "./hired";
import { jobSearch } from "./job-search";
import { stillDeciding } from "./still-deciding";
import type { AreaId, PathwayCurriculum, PathwayId, TaskDef } from "./types";

export * from "./forms";
export * from "./types";

/** The full curriculum: 5 pathways × 5 readiness areas × 6 tasks = 150 tasks. */
export const CURRICULUM: Record<PathwayId, PathwayCurriculum> = {
  hired,
  job_search: jobSearch,
  higher_ed: higherEd,
  entrepreneurship,
  still_deciding: stillDeciding,
};

export const taskId = (pathway: PathwayId, area: AreaId, slug: string) =>
  `${pathway}.${area}.${slug}`;

export type FlatTask = TaskDef & {
  id: string;
  pathwayId: PathwayId;
  areaId: AreaId;
  sortOrder: number;
};

/** Every task with its id, pathway, area and a stable sort order. */
export function flattenCurriculum(): FlatTask[] {
  const out: FlatTask[] = [];
  for (const [pathwayId, areas] of Object.entries(CURRICULUM) as [PathwayId, PathwayCurriculum][]) {
    let order = 0;
    for (const area of READINESS_AREAS) {
      for (const task of areas[area.id]) {
        out.push({
          ...task,
          id: taskId(pathwayId, area.id, task.slug),
          pathwayId,
          areaId: area.id,
          sortOrder: ++order,
        });
      }
    }
  }
  return out;
}
