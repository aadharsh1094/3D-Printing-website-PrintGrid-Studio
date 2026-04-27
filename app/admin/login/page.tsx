"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Boxes } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Login failed");
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="hero-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Boxes className="h-5 w-5" />
          <span className="text-sm font-semibold">PrintGrid Studio</span>
        </Link>
        <div className="card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin sign in</h1>
              <p className="text-xs text-muted-foreground">
                Authorized personnel only
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                required
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-xs text-muted-foreground">
            Credentials are set in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code>.
            Default:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">admin</code> /{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">printgrid-admin</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
