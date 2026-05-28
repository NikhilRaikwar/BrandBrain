import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BrandBrain Pitch Deck",
  description:
    "Pitch deck for BrandBrain: problem, solution, tech stack, and target audience.",
  icons: {
    icon: "/brandbrainlogo.png",
    shortcut: "/brandbrainlogo.png",
    apple: "/brandbrainlogo.png",
  },
};

export default function BrandBrainSlidesPage() {
  return (
    <main style={{ height: "100vh", overflow: "hidden", background: "#faf8f3" }}>
      <iframe
        title="BrandBrain Pitch Deck"
        src="/brandbrainslide.html"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          background: "#faf8f3",
        }}
      />
    </main>
  );
}
