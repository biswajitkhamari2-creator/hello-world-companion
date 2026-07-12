import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { supabase } from "@/integrations/supabase/client";

function AuthPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMark size="sm" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(() => {
    let alive = true;
    const fallback = setTimeout(() => {
      if (alive) setReady(true);
    }, 1_200);

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      clearTimeout(fallback);
      if (!data.session?.user) {
        navigate({ to: "/auth", search: { redirect: href }, replace: true });
        return;
      }
      setReady(true);
    }).catch(() => {
      if (!alive) return;
      clearTimeout(fallback);
      navigate({ to: "/auth", search: { redirect: href }, replace: true });
    });

    return () => {
      alive = false;
      clearTimeout(fallback);
    };
  }, [href, navigate]);

  return ready ? <Outlet /> : <AuthPending />;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: AuthenticatedLayout,
});