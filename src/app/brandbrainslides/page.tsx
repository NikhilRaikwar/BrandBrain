import type { Metadata } from "next";
import { readFile } from "fs/promises";
import { join } from "path";

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

export default async function BrandBrainSlidesPage() {
  const htmlPath = join(process.cwd(), "public", "brandbrainslide.html");
  const rawHtml = await readFile(htmlPath, "utf8");
  const html = rawHtml
    .replaceAll('src="brandbrainlogo.png"', 'src="/brandbrainlogo.png"')
    .replaceAll('href="brandbrainlogo.png"', 'href="/brandbrainlogo.png"');

  return (
    <main style={{ height: "100vh", overflow: "hidden", background: "#faf8f3" }}>
      <iframe
        title="BrandBrain Pitch Deck"
        srcDoc={html}
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
