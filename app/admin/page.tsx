import Link from "next/link";
import { getAnalytics, listOrders } from "@/lib/orders";
import { STATUS_LABELS, type OrderStatus } from "@/lib/db";
import { MATERIALS } from "@/lib/quote";
import { formatCurrency } from "@/lib/utils";
import { Package, IndianRupee, BarChart3, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [analytics, orders] = await Promise.all([
    getAnalytics(),
    listOrders().then((all) => all.slice(0, 5)),
  ]);

  const topMat =
    MATERIALS.find((m) => m.id === analytics.topMaterial)?.name ??
    analytics.topMaterial ??
    "—";

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total orders"
          value={String(analytics.totalOrders)}
          icon={Package}
        />
        <Stat
          label="Revenue (completed)"
          value={formatCurrency(analytics.totalRevenue)}
          icon={IndianRupee}
        />
        <Stat
          label="Avg order value"
          value={formatCurrency(analytics.avgOrderValue)}
          icon={BarChart3}
        />
        <Stat label="Top material" value={topMat} icon={Layers} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No orders yet. Once a customer submits one, it'll show up here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => {
                const total =
                  (o.final_price + o.labour_charges) * o.quantity - o.discount;
                return (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm">{o.id}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {o.customer_name} · {o.file_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusPill status={o.status as OrderStatus} />
                        <span className="font-mono text-sm">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border bg-background p-6">
          <h2 className="mb-4 font-semibold">By status</h2>
          <ul className="space-y-2 text-sm">
            {(
              [
                "pending",
                "confirmed",
                "printing",
                "completed",
                "delivered",
                "cancelled",
              ] as OrderStatus[]
            ).map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {STATUS_LABELS[s]}
                </span>
                <span className="font-mono">
                  {analytics.statusCounts[s] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const palette: Record<OrderStatus, string> = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    printing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    delivered: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${palette[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
