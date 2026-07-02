import { createServerFn } from "@tanstack/react-start";
import { getAiRequestLog, type AiProviderName } from "./ai-gateway.server";

export interface ProviderStats {
  provider: AiProviderName;
  total: number;
  success: number;
  failure: number;
  successRate: number;
  avgDurationMs: number;
  p95DurationMs: number;
}

export interface ModelStats {
  model: string;
  provider: AiProviderName;
  total: number;
  success: number;
  failure: number;
  avgDurationMs: number;
}

export interface AiAnalyticsSummary {
  windowMinutes: number;
  totalRequests: number;
  successRate: number;
  avgDurationMs: number;
  perProvider: ProviderStats[];
  perModel: ModelStats[];
  recentFailures: Array<{
    ts: number;
    provider: AiProviderName;
    model?: string;
    status: number;
    errorMessage?: string;
  }>;
  bucketsPerMinute: Array<{ ts: number; success: number; failure: number }>;
  note: string;
}

function pct(nums: number[], p: number): number {
  if (!nums.length) return 0;
  const sorted = nums.slice().sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

export const getAiAnalytics = createServerFn({ method: "GET" })
  .inputValidator((input: { windowMinutes?: number } | undefined) => ({
    windowMinutes: Math.min(24 * 60, Math.max(5, input?.windowMinutes ?? 60)),
  }))
  .handler(async ({ data }): Promise<AiAnalyticsSummary> => {
    const log = getAiRequestLog();
    const cutoff = Date.now() - data.windowMinutes * 60_000;
    const scoped = log.filter((r) => r.ts >= cutoff);

    // Per-provider
    const providerMap = new Map<AiProviderName, typeof scoped>();
    for (const r of scoped) {
      if (!providerMap.has(r.provider)) providerMap.set(r.provider, []);
      providerMap.get(r.provider)!.push(r);
    }
    const perProvider: ProviderStats[] = Array.from(providerMap.entries()).map(([provider, rows]) => {
      const success = rows.filter((r) => r.ok).length;
      const durations = rows.map((r) => r.durationMs);
      return {
        provider,
        total: rows.length,
        success,
        failure: rows.length - success,
        successRate: rows.length ? success / rows.length : 0,
        avgDurationMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
        p95DurationMs: Math.round(pct(durations, 95)),
      };
    }).sort((a, b) => b.total - a.total);

    // Per-model
    const modelMap = new Map<string, typeof scoped>();
    for (const r of scoped) {
      const key = `${r.provider}::${r.model ?? "unknown"}`;
      if (!modelMap.has(key)) modelMap.set(key, []);
      modelMap.get(key)!.push(r);
    }
    const perModel: ModelStats[] = Array.from(modelMap.entries()).map(([key, rows]) => {
      const [provider, model] = key.split("::");
      const success = rows.filter((r) => r.ok).length;
      const durations = rows.map((r) => r.durationMs);
      return {
        model,
        provider: provider as AiProviderName,
        total: rows.length,
        success,
        failure: rows.length - success,
        avgDurationMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      };
    }).sort((a, b) => b.total - a.total);

    const recentFailures = scoped
      .filter((r) => !r.ok)
      .slice(-20)
      .reverse()
      .map((r) => ({
        ts: r.ts,
        provider: r.provider,
        model: r.model,
        status: r.status,
        errorMessage: r.errorMessage,
      }));

    // Per-minute buckets
    const bucketMap = new Map<number, { success: number; failure: number }>();
    for (const r of scoped) {
      const bucket = Math.floor(r.ts / 60_000) * 60_000;
      if (!bucketMap.has(bucket)) bucketMap.set(bucket, { success: 0, failure: 0 });
      const b = bucketMap.get(bucket)!;
      if (r.ok) b.success++; else b.failure++;
    }
    const bucketsPerMinute = Array.from(bucketMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([ts, b]) => ({ ts, success: b.success, failure: b.failure }));

    const totalSuccess = scoped.filter((r) => r.ok).length;
    const allDurations = scoped.map((r) => r.durationMs);
    return {
      windowMinutes: data.windowMinutes,
      totalRequests: scoped.length,
      successRate: scoped.length ? totalSuccess / scoped.length : 0,
      avgDurationMs: allDurations.length ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length) : 0,
      perProvider,
      perModel,
      recentFailures,
      bucketsPerMinute,
      note: "In-memory metrics from the current server instance. Resets on cold start / redeploy.",
    };
  });