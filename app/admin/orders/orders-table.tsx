"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  STATUS_LABELS,
  type OrderRow,
  type OrderStatus,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Flame, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "printing",
  "completed",
  "delivered",
  "cancelled",
];

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [flagOnly, setFlagOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (flagOnly && !o.urgent && !o.complex) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_contact.toLowerCase().includes(q) ||
        o.file_name.toLowerCase().includes(q)
      );
    });
  }, [orders, query, status, flagOnly]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID, name, phone, or file..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {s === "all" ? "All" : STATUS_LABELS[s as OrderStatus]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFlagOnly((v) => !v)}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            flagOnly
              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Flagged
        </button>
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length === orders.length
          ? `${orders.length} orders`
          : `${filtered.length} of ${orders.length} orders`}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            {orders.length === 0 ? "No orders yet." : "No orders match your filters."}
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
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
              {filtered.map((o) => {
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
