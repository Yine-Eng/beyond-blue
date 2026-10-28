import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-36 w-full rounded-[var(--radius-card)]" />
      <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
      <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
    </div>
  );
}
