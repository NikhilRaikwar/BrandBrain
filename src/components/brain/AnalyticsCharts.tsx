"use client";

import { StatCard } from "./StatCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsChartsProps = {
  scoreSeries: Array<{ date: string; avg_before: number; avg_after: number }>;
  querySeries: Array<{ day: string; count: number }>;
  costTable: Array<{ date: string; queries: number; scores: number; tokens: number; cost_usd: number; cost_inr: number }>;
  totalCosts: { usd: number; inr: number };
  overallStats: { docs: number; concepts: number; queries: number; scores: number };
};

function tooltipStyle() {
  return {
    background: "#1a1510",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#faf8f3",
  } as const;
}

export function AnalyticsCharts({ scoreSeries, querySeries, costTable, totalCosts, overallStats }: AnalyticsChartsProps) {
  const scoreData = scoreSeries.length > 0 ? scoreSeries : Array.from({ length: 7 }, (_, index) => ({
    date: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
    avg_before: 0,
    avg_after: 0,
  }));
  const queryData = querySeries.length > 0 ? querySeries : Array.from({ length: 7 }, (_, index) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
    count: 0,
  }));
  const costData = costTable.length > 0 ? costTable : Array.from({ length: 7 }, (_, index) => ({
    date: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
    queries: 0,
    scores: 0,
    tokens: 0,
    cost_usd: 0,
    cost_inr: 0,
  }));

  return (
    <div className="space-y-6">
      <section className="stats-grid">
        <StatCard label="Total Docs" value={overallStats.docs} iconEmoji="📄" accentColor="green" />
        <StatCard label="Concepts" value={overallStats.concepts} iconEmoji="🧩" accentColor="purple" />
        <StatCard label="Queries" value={overallStats.queries} iconEmoji="💬" accentColor="blue" />
        <StatCard label="Scores Run" value={overallStats.scores} iconEmoji="⚡" accentColor="orange" />
        <StatCard
          label="Total Spend"
          value={`₹${Math.round(totalCosts.inr).toLocaleString("en-IN")}`}
          iconEmoji="💸"
          accentColor="orange"
          subText={`USD ${totalCosts.usd.toFixed(4)}`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Copy Quality Over Time</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData}>
                <CartesianGrid stroke="rgba(26,21,16,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--ink4)" />
                <YAxis stroke="var(--ink4)" />
                <Tooltip contentStyle={tooltipStyle()} />
                <Line type="monotone" dataKey="avg_before" name="Before" stroke="var(--orange)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avg_after" name="After" stroke="var(--green)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Queries Per Day (Last 7 Days)</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queryData}>
                <CartesianGrid stroke="rgba(26,21,16,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--ink4)" />
                <YAxis stroke="var(--ink4)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="count" fill="var(--blue)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Cost Per Day</h2>
        <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData}>
              <CartesianGrid stroke="rgba(26,21,16,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--ink4)"
                tickFormatter={(value) => {
                  const date = new Date(`${value}T00:00:00Z`);
                  if (Number.isNaN(date.getTime())) return value;
                  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
                }}
              />
              <YAxis stroke="var(--ink4)" />
              <Tooltip
                contentStyle={tooltipStyle()}
                formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spend"]}
              />
              <Bar dataKey="cost_inr" fill="var(--green)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
