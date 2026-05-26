import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div className="card">
          <LoadingSkeleton lines={2} height="1.25rem" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="card card-green">
            <LoadingSkeleton lines={2} />
          </div>
          <div className="card card-purple">
            <LoadingSkeleton lines={2} />
          </div>
          <div className="card card-orange">
            <LoadingSkeleton lines={2} />
          </div>
          <div className="card">
            <LoadingSkeleton lines={2} />
          </div>
        </div>
      </div>
    </main>
  );
}
