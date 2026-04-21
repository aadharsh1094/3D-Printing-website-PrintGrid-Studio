"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { STATUS_FLOW, STATUS_LABELS, type OrderRow, type OrderStatus } from "@/lib/types";
import { Save, Flame, AlertTriangle } from "lucide-react";

type Props = { order: OrderRow };

export function OrderEditor({ order }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [finalPrice, setFinalPrice] = useState(order.final_price);
  const [labour, setLabour] = useState(order.labour_charges);
  const [discount, setDiscount] = useState(order.discount);
  const [quantity, setQuantity] = useState(order.quantity);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [urgent, setUrgent] = useState(!!order.urgent);
  const [complex, setComplex] = useState(!!order.complex);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          final_price: finalPrice,
          labour_charges: labour,
          discount,
          quantity,
          notes,
          urgent: urgent ? 1 : 0,
          complex: complex ? 1 : 0,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Update failed");
      }
      setSaved(true);
      startTransition(() => router.refresh());
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function quickStatus(s: OrderStatus) {
    setStatus(s);
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6 rounded-lg border border-border bg-background p-6">
      <div>
        <h2 className="text-sm font-semibold">Status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => quickStatus(s)}
              disabled={saving || pending}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          <button
            onClick={() => quickStatus("cancelled")}
            disabled={saving || pending}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              status === "cancelled"
                ? "border-red-500 bg-red-500 text-white"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Cancel order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
        <NumberField
          label="Unit price (₹)"
          value={finalPrice}
          onChange={setFinalPrice}
        />
        <NumberField
          label="Labour (₹)"
          value={labour}
          onChange={setLabour}
        />
        <NumberField
          label="Discount (₹)"
          value={discount}
          onChange={setDiscount}
        />
        <NumberField
          label="Quantity"
          value={quantity}
          min={1}
          onChange={setQuantity}
        />
      </div>

      <div className="flex flex-wrap gap-4 border-t border-border pt-5">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
            className="h-4 w-4"
          />
          <Flame className="h-4 w-4 text-red-500" />
          Urgent
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={complex}
            onChange={(e) => setComplex(e.target.checked)}
            className="h-4 w-4"
          />
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Complex job
        </label>
      </div>

      <div className="border-t border-border pt-5">
        <label className="mb-1.5 block text-sm font-semibold">
          Admin notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Internal notes: supports needed, color preference, shipping instructions..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="text-sm text-emerald-500">Saved ✓</span>}
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type="number"
        min={min}
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
