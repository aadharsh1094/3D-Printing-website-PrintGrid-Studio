import Link from "next/link";
import { headers } from "next/headers";
import { LogOut, LayoutDashboard, Package, Calculator } from "lucide-react";
import { LogoutButton } from "./logout-button";

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
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl gap-6 px-4 py-6 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-20 space-y-1">
          <AdminLink href="/admin" label="Dashboard" icon={LayoutDashboard} />
          <AdminLink href="/admin/orders" label="Orders" icon={Package} />
          <AdminLink
            href="/admin/quick-quote"
            label="Quick Quote"
            icon={Calculator}
          />
          <div className="mt-6 border-t border-border pt-3">
            <LogoutButton />
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function AdminLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

void LogOut;
