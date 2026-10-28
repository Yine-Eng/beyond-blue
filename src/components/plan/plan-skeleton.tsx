import { Skeleton } from "@/components/ui/skeleton";

export function PlanSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your plan" className="flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="rounded-card h-36 w-full" />
      <Skeleton className="rounded-card h-40 w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="rounded-card h-20 w-full" />
      ))}
    </div>
  );
}
