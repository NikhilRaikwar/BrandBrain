import Link from "next/link";
import { BrandMark } from "@/components/shared/BrandMark";
import { BrainCircuit, Sparkles, Target } from "lucide-react";

const socialProofIcons = [
  { icon: BrainCircuit, label: "Memory", tone: "mint" },
  { icon: Sparkles, label: "Ideas", tone: "sand" },
  { icon: Target, label: "Focus", tone: "amber" },
];

export default function HomePage() {
  return (
    <main>
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <BrandMark />
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#how-it-works" className="nav-link">
              How it works
            </a>
            <Link href="/login" className="nav-link">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Get started free →
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="badge">🏆 OpenAI × Outskill Hackathon 2026</div>
          <h1>
            Your agency&apos;s <em>creative memory,</em>
            <br />
            never lost again.
          </h1>
          <p>
            BrandBrain ingests your campaigns, briefs, and brand guides — then scores every new piece of copy against your own best work.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="btn btn-orange">
              Start free →
            </Link>
            <a href="#how-it-works" className="btn btn-outline">
              See how it works
            </a>
          </div>
          <div className="hero-social-proof">
            <div className="proof-chips" aria-label="BrandBrain highlights">
              {socialProofIcons.map(({ icon: Icon, label, tone }) => (
                <div key={label} className={`proof-chip proof-chip-${tone}`} aria-hidden="true" title={label}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>
            <span>Built for agencies at the OpenAI Hackathon</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-header">
            <div className="dot" style={{ background: "#ef4444" }} />
            <div className="dot" style={{ background: "#f59e0b" }} />
            <div className="dot" style={{ background: "#22c55e" }} />
            <span style={{ fontSize: 13, color: "#6b6254", marginLeft: 8 }}>
              BrandBrain · Query Console
            </span>
          </div>
          <div className="visual-body">
            <div className="chat-msg chat-user">
              What tone works best for FMCG youth campaigns?
            </div>
            <div className="chat-msg chat-brain">
              Based on your latest campaign, direct address + conversational tone outperforms formal tone. Always lead with action verbs.
              <div className="source-tags">
                <span className="source-tag">Brand Guide</span>
                <span className="source-tag">Launch Campaign</span>
              </div>
            </div>
            <div className="score-card">
              <div className="score-ring">
                <span>82</span>
              </div>
              <div>
                <span className="score-label">
                  <strong>Copy score improved</strong>
                  54 → 82 after rewrite
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="logos-bar">
        <div className="logos-inner">
          <p className="logos-label">Built with the best tools</p>
          <div className="logos-row">
            <span className="logo-item">OpenAI GPT-4o-mini</span>
            <span className="logo-item">Supabase</span>
            <span className="logo-item">Next.js 14</span>
            <span className="logo-item">Vercel</span>
            <span className="logo-item">Tailwind CSS</span>
          </div>
        </div>
      </div>

      <div className="section" id="features">
        <p className="section-label">What BrandBrain does</p>
        <h2 className="section-title">Three layers of agency intelligence</h2>
        <p className="section-sub">
          Most agencies lose 40% of their institutional knowledge when a senior hire leaves. BrandBrain makes that knowledge permanent.
        </p>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon green">🗄️</div>
            <h3>Knowledge Layer</h3>
            <p>
              Paste any campaign brief, brand guide, or performance note. GPT-4o-mini extracts 3–7 structured knowledge cards with concepts, summaries, and tags.
            </p>
          </div>
          <div className="feat-card">
            <div className="feat-icon orange">⚖️</div>
            <h3>Judgment Layer</h3>
            <p>
              Score new copy 0–100 using David Ogilvy&apos;s 15 advertising principles, benchmarked against your own historical winners. Get a rewrite in the same call.
            </p>
          </div>
          <div className="feat-card">
            <div className="feat-icon blue">🔧</div>
            <h3>Skills Layer</h3>
            <p>
              Query your brain in plain English. Get cited answers from your own past campaigns — not generic AI output that sounds like everyone else.
            </p>
          </div>
          <div className="feat-card">
            <div className="feat-icon orange">💬</div>
            <h3>Citation-backed Q&amp;A</h3>
            <p>
              Every answer cites which documents it came from. No hallucinations — just your agency&apos;s knowledge, retrieved and explained with precision.
            </p>
          </div>
          <div className="feat-card">
            <div className="feat-icon green">📊</div>
            <h3>Usage Analytics</h3>
            <p>
              Track every query, score, and ingest in one place. See usage by day, by client, and by operation so nothing gets lost.
            </p>
          </div>
          <div className="feat-card">
            <div className="feat-icon blue">🔗</div>
            <h3>Public Brain Sharing</h3>
            <p>
              Generate a shareable link so clients or new hires can query your brain — no login required. You control exactly what&apos;s public.
            </p>
          </div>
        </div>
      </div>

      <div className="process-section" id="how-it-works">
        <div className="process-inner">
          <p className="section-label">How it works</p>
          <h2 className="section-title">From document to decision in 3 steps</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h4>Ingest your documents</h4>
              <p>Paste campaigns, briefs, brand guides, or performance data. Choose the source type and client name. Done in under a minute.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>AI extracts knowledge</h4>
              <p>GPT-4o-mini reads your document and pulls out 3–7 structured knowledge cards — concepts your brain can search and reason over.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>Query, score, rewrite</h4>
              <p>Ask your brain anything. Score copy against your history. Get AI rewrites that sound like your best work — not a random prompt.</p>
            </div>
          </div>
          <div className="demo-table">
          <div className="demo-row header">
            <div className="demo-cell">Operation</div>
            <div className="demo-cell">What AI does</div>
            <div className="demo-cell">Outcome</div>
          </div>
          <div className="demo-row">
            <div className="demo-cell">
              <strong>Ingest document</strong>
            </div>
            <div className="demo-cell">Extract 3–7 knowledge cards</div>
            <div className="demo-cell"><span className="pill pill-green">Structured memory</span></div>
          </div>
          <div className="demo-row">
            <div className="demo-cell">
              <strong>Query brain</strong>
            </div>
            <div className="demo-cell">Retrieve + answer with citations</div>
            <div className="demo-cell"><span className="pill pill-green">Cited answer</span></div>
          </div>
          <div className="demo-row">
            <div className="demo-cell">
              <strong>Score + rewrite</strong>
            </div>
            <div className="demo-cell">Ogilvy 15-principle analysis + rewrite</div>
            <div className="demo-cell"><span className="pill pill-orange">Rewrite + rationale</span></div>
          </div>
        </div>
      </div>
      </div>

      <div className="cta-section">
        <div className="cta-inner">
          <h2>
            Your best creative work,
            <br />
            always within reach.
          </h2>
          <p>Start free. Sign up and BrandBrain will guide you through creating your first real brain so you can explore every feature in 2 minutes.</p>
          <div className="cta-buttons">
            <Link href="/signup" className="btn btn-cream">
              Start building your brain →
            </Link>
            <Link href="/login" className="btn btn-ghost-light">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <span className="footer-logo">BrandBrain</span>
          <span className="footer-note">Built for OpenAI × Outskill AI Builders Hackathon · May 2026</span>
        </div>
      </footer>
    </main>
  );
}
