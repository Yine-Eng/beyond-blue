import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="rounded-card h-36 w-full" />
      <Skeleton className="rounded-card h-20 w-full" />
      <Skeleton className="rounded-card h-20 w-full" />
    </div>
  );
}
