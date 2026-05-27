"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WelcomeBannerProps = {
  docsIngested: number;
  userName: string;
  message: string;
};

export function WelcomeBanner({ docsIngested, userName, message }: WelcomeBannerProps) {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
  }, []);

  const hasBrain = docsIngested > 0;

  return (
    <div className="welcome-banner">
      <div className="welcome-text">
        <h2>
          {greeting}, {userName} 👋
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink4)", marginTop: 4 }}>{message}</p>
      </div>
      <div className="welcome-actions">
        <Link href="/ingest" className="btn btn-primary btn-sm">
          📥 {hasBrain ? "Ingest Doc" : "Start Ingest"}
        </Link>
        <Link href="/query" className="btn btn-outline btn-sm">
          💬 Query Brain
        </Link>
      </div>
    </div>
  );
}
