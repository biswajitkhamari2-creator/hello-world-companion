import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, User as UserIcon, LogOut, Calendar, Shield } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — UPSC Genius AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setEmail(u?.email ?? null);
      setId(u?.id ?? null);
      setCreatedAt(u?.created_at ?? null);
      setProvider(u?.app_metadata?.provider ?? null);
    })();
  }, []);

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initial = (email?.[0] || "U").toUpperCase();

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="animate-scale-in rounded-2xl border border-border bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-amber-400/10 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-bold text-white shadow-lg animate-fade-in">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-xl font-bold">{email || "—"}</h1>
              <p className="text-xs text-muted-foreground">Signed in via {provider || "email"}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 text-sm">
            <Row icon={Mail} label="Email" value={email || "—"} />
            <Row icon={UserIcon} label="User ID" value={id || "—"} mono />
            <Row icon={Calendar} label="Joined" value={createdAt ? new Date(createdAt).toLocaleDateString() : "—"} />
            <Row icon={Shield} label="Auth Provider" value={provider || "email"} />
          </dl>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={signOut} className="text-rose-700 hover:bg-rose-50">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/60 p-3 animate-fade-in">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`truncate font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
      </div>
    </div>
  );
}