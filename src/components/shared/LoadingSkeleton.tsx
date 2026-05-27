import { cn } from "@/lib/utils";

type LoadingSkeletonProps = {
  lines?: number;
  height?: string;
};

export function LoadingSkeleton({ lines = 3, height = "1rem" }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn("animate-pulse rounded-lg bg-[var(--cream2)]")}
          style={{ height, width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
