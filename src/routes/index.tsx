import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your App" },
      { name: "description", content: "Replace this with a one-sentence description of your app." },
      { property: "og:title", content: "Your App" },
      { property: "og:description", content: "Replace this with a one-sentence description of your app." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">
        Your App
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Firebase Authentication is wired up. Sign in to access the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {loading ? (
          <span className="text-sm text-muted-foreground">Loading…</span>
        ) : user ? (
          <>
            <Link
              to="/dashboard"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
