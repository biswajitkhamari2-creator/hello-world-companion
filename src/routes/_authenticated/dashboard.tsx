import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../../lib/auth-context";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard" },
      { name: "description", content: "Your account dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm font-semibold text-foreground">
            Home
          </Link>
          <button
            onClick={() => signOut()}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome{profile?.displayName ? `, ${profile.displayName}` : ""}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in as {user?.email}.
        </p>
      </main>
    </div>
  );
}