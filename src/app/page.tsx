import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-[1100px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[var(--border)] pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-lg">
              🧠
            </div>
            <span className="font-display text-2xl font-bold text-[var(--white)]">BrandBrain</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonClassName("ghost", "sm")}>
              Sign In
            </Link>
            <Link href="/signup" className={buttonClassName("primary", "sm")}>
              Get Started
            </Link>
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center py-16">
          <div className="max-w-4xl text-center">
            <Badge className="badge-green">🧠 Company Brain for Agencies</Badge>
            <h1 className="mt-8 font-display text-5xl font-extrabold tracking-tight text-[var(--white)] sm:text-6xl lg:text-7xl">
              Your agency&apos;s creative memory,
              <span className="block text-[var(--accent)]">never lost again.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Ingest campaigns. Score copy. Preserve everything your best people know.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className={buttonClassName("primary", "lg")}>
                Start Building Your Brain
              </Link>
              <a href="#features" className={buttonClassName("outline", "lg")}>
                See How It Works
              </a>
            </div>

            <div
              id="features"
              className="mt-16 grid gap-6 md:grid-cols-3"
            >
              <div className="card card-green text-left">
                <div className="text-2xl">🗄️</div>
                <h3 className="mt-5 font-display text-2xl font-bold text-[var(--white)]">
                  Knowledge
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--text)]">
                  Every campaign, brief, and brand guideline - structured and queryable forever.
                </p>
              </div>
              <div className="card card-orange text-left">
                <div className="text-2xl">⚖️</div>
                <h3 className="mt-5 font-display text-2xl font-bold text-[var(--white)]">
                  Judgment
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--text)]">
                  Ogilvy-style scoring rates new copy against your agency&apos;s own historical winners.
                </p>
              </div>
              <div className="card card-purple text-left">
                <div className="text-2xl">🔧</div>
                <h3 className="mt-5 font-display text-2xl font-bold text-[var(--white)]">
                  Skills
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--text)]">
                  Reusable campaign frameworks any team member can use from Day 1.
                </p>
              </div>
            </div>

            <p className="mt-10 text-sm text-[var(--muted)]">
              Built for agencies tired of losing institutional knowledge when people leave.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
