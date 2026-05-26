"use client";

import { StatCard } from "./StatCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";

type AnalyticsChartsProps = {
  scoreSeries: Array<{ date: string; avg_before: number; avg_after: number }>;
  querySeries: Array<{ day: string; count: number }>;
  costTable: Array<{
    date: string;
    queries: number;
    scores: number;
    tokens: number;
    cost_inr: number;
  }>;
  topClients: Array<{ client: string; count: number }>;
  overallStats: { docs: number; concepts: number; queries: number; scores: number };
};

export function AnalyticsCharts({
  scoreSeries,
  querySeries,
  costTable,
  topClients,
  overallStats,
}: AnalyticsChartsProps) {
  const maxDocs = Math.max(...topClients.map((client) => client.count), 1);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Docs"
          value={overallStats.docs}
          iconName="upload"
          accentColor="green"
          className="p-6"
        />
        <StatCard
          label="Concepts"
          value={overallStats.concepts}
          iconName="brain"
          accentColor="purple"
          className="p-6"
        />
        <StatCard
          label="Queries"
          value={overallStats.queries}
          iconName="message"
          accentColor="orange"
          className="p-6"
        />
        <StatCard
          label="Scores"
          value={overallStats.scores}
          iconName="bar"
          accentColor="yellow"
          className="p-6"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-2xl font-bold text-[var(--white)]">Copy Quality Over Time</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip
                  contentStyle={{
                    background: "#0f1520",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    color: "#f0f4ff",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="avg_before" name="Before" stroke="#ff6b35" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avg_after" name="After" stroke="#00e5a0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-2xl font-bold text-[var(--white)]">Queries Per Day (Last 7 Days)</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={querySeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0f1520",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    color: "#f0f4ff",
                  }}
                />
                <Bar dataKey="count" fill="var(--accent3)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card overflow-hidden">
          <h2 className="font-display text-2xl font-bold text-[var(--white)]">Cost Table</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                <tr>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Queries</th>
                  <th className="pb-3">Scores</th>
                  <th className="pb-3">Tokens</th>
                  <th className="pb-3">Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {costTable.map((row) => (
                  <tr key={row.date} className="border-t border-[var(--border)]">
                    <td className="py-3 text-[var(--white)]">{row.date}</td>
                    <td className="py-3 text-[var(--text)]">{row.queries}</td>
                    <td className="py-3 text-[var(--text)]">{row.scores}</td>
                    <td className="py-3 text-[var(--text)]">{row.tokens}</td>
                    <td className="py-3 font-bold text-[var(--accent)]">₹{row.cost_inr.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t border-[var(--border)]">
                  <td className="py-3 font-bold text-[var(--accent)]">Total</td>
                  <td className="py-3 font-bold text-[var(--accent)]">
                    {costTable.reduce((sum, row) => sum + row.queries, 0)}
                  </td>
                  <td className="py-3 font-bold text-[var(--accent)]">
                    {costTable.reduce((sum, row) => sum + row.scores, 0)}
                  </td>
                  <td className="py-3 font-bold text-[var(--accent)]">
                    {costTable.reduce((sum, row) => sum + row.tokens, 0)}
                  </td>
                  <td className="py-3 font-bold text-[var(--accent)]">
                    ₹{costTable.reduce((sum, row) => sum + row.cost_inr, 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-2xl font-bold text-[var(--white)]">Top Clients</h2>
          <div className="mt-5 space-y-4">
            {topClients.map((client) => (
              <div key={client.client} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-[var(--white)]">{client.client}</div>
                  <Badge>{client.count} docs</Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${Math.max((client.count / maxDocs) * 100, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
