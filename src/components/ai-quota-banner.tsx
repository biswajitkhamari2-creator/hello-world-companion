import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, X, Zap } from "lucide-react";
import { getAiQuotaStatus, type AiQuotaStatus } from "@/lib/ai-quota-status.functions";
import { cn } from "@/lib/utils";

export function AiQuotaBanner() {
  const fn = useServerFn(getAiQuotaStatus);
  const { data } = useQuery<AiQuotaStatus>({
    queryKey: ["ai-quota-status"],
    queryFn: () => fn(),
    refetchInterval: 5 * 60_000,
    staleTime: 60_000,
    retry: false,
  });
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.sessionStorage.getItem("ai-quota-dismissed"));
  }, []);

  if (!data) return null;
  if (data.level === "ok") return null;
  const key = `${data.level}:${data.active ?? "none"}`;
  if (dismissed === key) return null;

  const styles =
    data.level === "down"
      ? "bg-red-600 text-white"
      : data.level === "critical"
        ? "bg-orange-500 text-white"
        : "bg-amber-400 text-amber-950";
  const Icon = data.level === "warn" ? Zap : data.level === "down" ? AlertTriangle : AlertTriangle;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium animate-pulse", styles)}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{data.message}</span>
      <span className="hidden sm:flex items-center gap-1.5">
        {data.providers.map((p) => (
          <span
            key={p.name}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              p.configured && p.authorized && !p.rateLimited
                ? "bg-emerald-500/90 text-white"
                : !p.configured
                  ? "bg-gray-400/60 text-white"
                  : "bg-red-600/80 text-white",
            )}
          >
            {p.configured && p.authorized && !p.rateLimited ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {p.label}
          </span>
        ))}
      </span>
      <button
        type="button"
        onClick={() => {
          setDismissed(key);
          window.sessionStorage.setItem("ai-quota-dismissed", key);
        }}
        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-black/10"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}