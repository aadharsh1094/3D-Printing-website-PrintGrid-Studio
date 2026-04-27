import Link from "next/link";
import { getAnalytics, listOrders } from "@/lib/orders";
import { getInventorySummary } from "@/lib/inventory";
import { STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { MATERIALS, ACTIVE_PRICING_ALGORITHM, PRICING_OPTIONS } from "@/lib/quote";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  IndianRupee,
  BarChart3,
  Layers,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [analytics, recent, inv] = await Promise.all([
    getAnalytics(),
    listOrders().then((all) => all.slice(0, 6)),
    getInventorySummary(),
  ]);

  const topMat =
    MATERIALS.find((m) => m.id === analytics.topMaterial)?.name ??
    analytics.topMaterial ??
    "—";

  const activePricing = PRICING_OPTIONS.find(
    (p) => p.id === ACTIVE_PRICING_ALGORITHM
  );

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "long",
          })}
        </span>
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

      {inv.lowStockCount > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="font-medium">
              {inv.lowStockCount} spool{inv.lowStockCount === 1 ? "" : "s"} below low-stock threshold
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Time to restock before your next bulk order.
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
          >
            View inventory →
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No orders yet. Once a customer submits one, it'll show up here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((o) => {
                const total =
                  (o.final_price + o.labour_charges) * o.quantity - o.discount;
                return (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm">{o.id}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {o.customer_name} · {o.file_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusPill status={o.status as OrderStatus} />
                        <span className="font-mono text-sm font-medium">
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

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold">By status</h2>
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

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Inventory</h2>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {(inv.totalRemaining / 1000).toFixed(1)} kg
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              across {inv.byMaterial.length} material{inv.byMaterial.length === 1 ? "" : "s"}
            </p>
            <div className="mt-3 space-y-1.5 text-xs">
              {inv.byMaterial.map((m) => (
                <div key={m.material_id} className="flex justify-between">
                  <span className="uppercase text-muted-foreground">
                    {m.material_id}
                  </span>
                  <span className="font-mono">
                    {m.remaining}g / {m.capacity}g
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Active pricing</h2>
            <p className="mt-2 font-medium">{activePricing?.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activePricing?.blurb}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Switch in <code className="rounded bg-muted px-1">lib/quote.ts</code>
            </p>
          </section>
        </div>
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
    <div className="card p-5 transition-shadow hover:shadow-md">
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
