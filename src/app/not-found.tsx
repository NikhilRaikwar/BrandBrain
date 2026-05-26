import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonClassName } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
      <div className="w-full max-w-lg">
        <EmptyState
          iconName="brain"
          title="Page not found"
          description="The brain path you requested does not exist or is not public."
        />
        <div className="mt-6 text-center">
          <Link href="/" className={buttonClassName("outline", "md")}>
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
