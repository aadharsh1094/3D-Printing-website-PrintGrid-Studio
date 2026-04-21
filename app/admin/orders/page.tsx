import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { STATUS_LABELS, type OrderStatus } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <span className="text-sm text-muted-foreground">
          {orders.length} total
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => {
                const total =
                  (o.final_price + o.labour_charges) * o.quantity - o.discount;
                return (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="flex items-center gap-2 font-mono text-primary hover:underline"
                      >
                        {o.id}
                        {o.urgent ? (
                          <Flame className="h-3.5 w-3.5 text-red-500" />
                        ) : null}
                        {o.complex ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.customer_contact}
                      </div>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3">
                      {o.file_name}
                    </td>
                    <td className="px-4 py-3 uppercase">{o.material_id}</td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3 font-mono">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={o.status as OrderStatus} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
