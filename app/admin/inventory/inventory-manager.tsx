"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InventoryItem } from "@/lib/types";
import type { Material } from "@/lib/quote";
import { Plus, Trash2, Save, AlertTriangle, Archive } from "lucide-react";

type Props = {
  initialItems: InventoryItem[];
  materials: Material[];
};

const blankForm = (materials: Material[]) => ({
  material_id: materials[0]?.id ?? "pla",
  brand: "",
  color_name: "",
  color_hex: "#ff5a1f",
  spool_capacity_g: 1000,
  remaining_g: 1000,
  cost_per_spool: 0,
  supplier: "",
  low_stock_g: 100,
  notes: "",
});

export function InventoryManager({ initialItems, materials }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(blankForm(materials));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        brand: form.brand || undefined,
        supplier: form.supplier || undefined,
        cost_per_spool: form.cost_per_spool || undefined,
        notes: form.notes || undefined,
      };
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Failed");
      }
      const reloaded = await fetch("/api/admin/inventory").then((r) => r.json());
      setItems(reloaded.items);
      setForm(blankForm(materials));
      setShowAdd(false);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((cur) => cur.map((i) => (i.id === id ? updated : i)));
      startTransition(() => router.refresh());
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this spool? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((cur) => cur.filter((i) => i.id !== id));
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {items.length} spool{items.length === 1 ? "" : "s"} tracked
        </span>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {showAdd ? "Cancel" : "Add spool"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="mb-4 text-sm font-semibold">New spool</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Material"
              value={form.material_id}
              onChange={(v) => setForm((f) => ({ ...f, material_id: v }))}
              options={materials.map((m) => ({ value: m.id, label: m.name }))}
            />
            <Input
              label="Color name"
              value={form.color_name}
              onChange={(v) => setForm((f) => ({ ...f, color_name: v }))}
              placeholder="e.g. Sunset Orange"
            />
            <ColorInput
              label="Color hex"
              value={form.color_hex}
              onChange={(v) => setForm((f) => ({ ...f, color_hex: v }))}
            />
            <Input
              label="Brand"
              value={form.brand}
              onChange={(v) => setForm((f) => ({ ...f, brand: v }))}
              placeholder="e.g. eSun, Polymaker"
            />
            <Input
              label="Supplier"
              value={form.supplier}
              onChange={(v) => setForm((f) => ({ ...f, supplier: v }))}
            />
            <NumberInput
              label="Cost per spool (₹)"
              value={form.cost_per_spool}
              onChange={(v) => setForm((f) => ({ ...f, cost_per_spool: v }))}
            />
            <NumberInput
              label="Spool capacity (g)"
              value={form.spool_capacity_g}
              onChange={(v) =>
                setForm((f) => ({ ...f, spool_capacity_g: v, remaining_g: v }))
              }
            />
            <NumberInput
              label="Remaining (g)"
              value={form.remaining_g}
              onChange={(v) => setForm((f) => ({ ...f, remaining_g: v }))}
            />
            <NumberInput
              label="Low-stock threshold (g)"
              value={form.low_stock_g}
              onChange={(v) => setForm((f) => ({ ...f, low_stock_g: v }))}
            />
          </div>
          <div className="mt-4">
            <Input
              label="Notes"
              value={form.notes}
              onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            />
          </div>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button
              onClick={add}
              disabled={saving || !form.color_name}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save spool"}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            No spools tracked yet. Click <strong>Add spool</strong> to start.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Spool</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const pct = Math.round((item.remaining_g / item.spool_capacity_g) * 100);
                const low = item.remaining_g <= item.low_stock_g;
                return (
                  <tr
                    key={item.id}
                    className={item.archived ? "opacity-50" : ""}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-6 w-6 rounded-full border border-border"
                          style={{ backgroundColor: item.color_hex }}
                        />
                        <div>
                          <p className="font-medium">{item.color_name}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {item.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 uppercase">{item.material_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.brand ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.remaining_g}
                          onChange={(e) =>
                            patch(item.id, {
                              remaining_g: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm font-mono"
                        />
                        <span className="text-xs text-muted-foreground">
                          / {item.spool_capacity_g}g
                        </span>
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full ${low ? "bg-red-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                          />
                        </div>
                        {low && !item.archived && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.cost_per_spool != null
                        ? `₹${item.cost_per_spool}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            patch(item.id, { archived: item.archived ? 0 : 1 })
                          }
                          title={item.archived ? "Unarchive" : "Archive"}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(item.id)}
                          title="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pending && null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-border bg-background"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
        />
      </div>
    </div>
  );
}
