import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshCw, Activity, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAiAnalytics } from "@/lib/ai-analytics.functions";

export const Route = createFileRoute("/_authenticated/admin/ai-analytics")({
  head: () => ({
    meta: [
      { title: "AI Analytics — UPSC Genius AI" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AiAnalyticsPage,
});

const WINDOWS = [
  { label: "15m", value: 15 },
  { label: "1h", value: 60 },
  { label: "6h", value: 360 },
  { label: "24h", value: 1440 },
];

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}
function fmtMs(n: number) {
  return n > 1000 ? `${(n / 1000).toFixed(2)}s` : `${n}ms`;
}
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

function AiAnalyticsPage() {
  const [windowMinutes, setWindow] = useState(60);
  const fetchAnalytics = useServerFn(getAiAnalytics);
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["ai-analytics", windowMinutes],
    queryFn: () => fetchAnalytics({ data: { windowMinutes } }),
    refetchInterval: 15_000,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Provider health, latency, and error visibility for all AI calls routed through the gateway.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-0.5">
            {WINDOWS.map((w) => (
              <button
                key={w.value}
                onClick={() => setWindow(w.value)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                  windowMinutes === w.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load analytics: {error instanceof Error ? error.message : String(error)}
        </div>
      ) : null}

      {isLoading || !data ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Activity className="h-4 w-4" />} label="Requests" value={data.totalRequests.toLocaleString()} />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              label="Success rate"
              value={fmtPct(data.successRate)}
            />
            <StatCard icon={<Zap className="h-4 w-4 text-amber-500" />} label="Avg latency" value={fmtMs(data.avgDurationMs)} />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
              label="Failures"
              value={String(data.perProvider.reduce((a, p) => a + p.failure, 0))}
            />
          </div>

          <section className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Provider health</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Provider</th>
                    <th className="px-4 py-2">Requests</th>
                    <th className="px-4 py-2">Success</th>
                    <th className="px-4 py-2">Fail</th>
                    <th className="px-4 py-2">Success rate</th>
                    <th className="px-4 py-2">Avg latency</th>
                    <th className="px-4 py-2">p95 latency</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.perProvider.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                        No AI requests in this window yet.
                      </td>
                    </tr>
                  ) : (
                    data.perProvider.map((p) => {
                      const healthy = p.successRate >= 0.9;
                      return (
                        <tr key={p.provider} className="border-t">
                          <td className="px-4 py-2 font-medium">{p.provider}</td>
                          <td className="px-4 py-2">{p.total}</td>
                          <td className="px-4 py-2 text-emerald-600">{p.success}</td>
                          <td className="px-4 py-2 text-red-600">{p.failure}</td>
                          <td className="px-4 py-2">{fmtPct(p.successRate)}</td>
                          <td className="px-4 py-2">{fmtMs(p.avgDurationMs)}</td>
                          <td className="px-4 py-2">{fmtMs(p.p95DurationMs)}</td>
                          <td className="px-4 py-2">
                            <Badge variant={healthy ? "default" : "destructive"}>
                              {healthy ? "Healthy" : "Degraded"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Top models</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Model</th>
                    <th className="px-4 py-2">Provider</th>
                    <th className="px-4 py-2">Requests</th>
                    <th className="px-4 py-2">Fail</th>
                    <th className="px-4 py-2">Avg latency</th>
                  </tr>
                </thead>
                <tbody>
                  {data.perModel.slice(0, 10).map((m, i) => (
                    <tr key={`${m.provider}-${m.model}-${i}`} className="border-t">
                      <td className="px-4 py-2 font-mono text-xs">{m.model}</td>
                      <td className="px-4 py-2">{m.provider}</td>
                      <td className="px-4 py-2">{m.total}</td>
                      <td className="px-4 py-2 text-red-600">{m.failure}</td>
                      <td className="px-4 py-2">{fmtMs(m.avgDurationMs)}</td>
                    </tr>
                  ))}
                  {data.perModel.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No data.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Recent failures</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Provider</th>
                    <th className="px-4 py-2">Model</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentFailures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No failures in this window. 🎉
                      </td>
                    </tr>
                  ) : (
                    data.recentFailures.map((f, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2 whitespace-nowrap">{fmtTime(f.ts)}</td>
                        <td className="px-4 py-2">{f.provider}</td>
                        <td className="px-4 py-2 font-mono text-xs">{f.model ?? "—"}</td>
                        <td className="px-4 py-2">{f.status || "network"}</td>
                        <td className="px-4 py-2 max-w-lg truncate text-xs text-muted-foreground" title={f.errorMessage}>
                          {f.errorMessage ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-xs text-muted-foreground">{data.note}</p>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}