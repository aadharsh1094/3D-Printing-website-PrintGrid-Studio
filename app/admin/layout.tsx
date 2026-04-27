import Link from "next/link";
import { headers } from "next/headers";
import { Boxes } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-invoke-path") ?? h.get("x-next-url") ?? "";
  const isLogin = pathname.endsWith("/admin/login");

  if (isLogin) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <Link
            href="/admin"
            className="flex items-center gap-2 border-b border-border px-5 py-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Boxes className="h-5 w-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">PrintGrid</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </Link>
          <AdminSidebar />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
