"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type * as THREE from "three";
import { StlViewer, parseStl } from "@/components/stl-viewer";
import { MATERIALS, calculateQuote, type PrintSettings } from "@/lib/quote";
import { formatCurrency } from "@/lib/utils";
import { UploadCloud, Save, Copy } from "lucide-react";

type LoadedModel = {
  file: File;
  geometry: THREE.BufferGeometry;
  volumeCm3: number;
  bboxCm: { x: number; y: number; z: number };
};

const DEFAULT: PrintSettings = {
  scale: 1,
  infillPercent: 20,
  wallCount: 3,
  layerHeightMm: 0.2,
  materialId: "pla",
};

export default function QuickQuotePage() {
  const router = useRouter();
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const material =
    MATERIALS.find((m) => m.id === settings.materialId) ?? MATERIALS[0];
  const quote = useMemo(() => {
    if (!model) return null;
    return calculateQuote({
      volumeCm3: model.volumeCm3,
      bboxCm: model.bboxCm,
      settings,
    });
  }, [model, settings]);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      if (!file.name.toLowerCase().endsWith(".stl")) {
        throw new Error("Only .stl files are supported.");
      }
      const parsed = await parseStl(file);
      setModel({ file, ...parsed });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load model.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAsOrder() {
    if (!model || !quote) return;
    if (!customerName.trim() || !customerContact.trim()) {
      setError("Enter the customer's name and contact to save an order.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", model.file);
      fd.append("customerName", customerName.trim());
      fd.append("customerContact", customerContact.trim());
      fd.append("materialId", settings.materialId);
      fd.append("scale", String(settings.scale));
      fd.append("infillPercent", String(settings.infillPercent));
      fd.append("wallCount", String(settings.wallCount));
      fd.append("layerHeightMm", String(settings.layerHeightMm));
      fd.append("quantity", String(quantity));
      fd.append("volumeCm3", String(model.volumeCm3));
      fd.append("bboxX", String(model.bboxCm.x));
      fd.append("bboxY", String(model.bboxCm.y));
      fd.append("bboxZ", String(model.bboxCm.z));

      const res = await fetch("/api/orders", { method: "POST", body: fd });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Failed");
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/admin/orders/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setLoading(false);
    }
  }

  function copyQuoteMessage() {
    if (!quote || !model) return;
    const total = quote.total * quantity;
    const msg = [
      `PrintGrid Studio quote:`,
      ``,
      `File: ${model.file.name}`,
      `Material: ${material.name}`,
      `Size: ${(model.bboxCm.x * settings.scale).toFixed(1)} × ${(model.bboxCm.y * settings.scale).toFixed(1)} × ${(model.bboxCm.z * settings.scale).toFixed(1)} cm`,
      `Infill: ${settings.infillPercent}% | Walls: ${settings.wallCount} | Layer: ${settings.layerHeightMm} mm`,
      `Quantity: ${quantity}`,
      ``,
      `Total: ₹${Math.round(total)}`,
    ].join("\n");
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Quick Quote</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          For WhatsApp customers — upload their file, get a quote, copy the
          message or save as an order.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {!model ? (
            <label
              htmlFor="qq-upload"
              className="flex h-[380px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/60"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-medium">
                {loading ? "Parsing..." : "Drop STL or click to browse"}
              </p>
              <input
                ref={inputRef}
                id="qq-upload"
                type="file"
                accept=".stl"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          ) : (
            <>
              <StlViewer
                geometry={model.geometry}
                scale={settings.scale}
                color={material.color}
              />
              <p className="text-sm text-muted-foreground">
                {model.file.name} ·{" "}
                {(model.bboxCm.x * settings.scale).toFixed(1)} ×{" "}
                {(model.bboxCm.y * settings.scale).toFixed(1)} ×{" "}
                {(model.bboxCm.z * settings.scale).toFixed(1)} cm
              </p>
            </>
          )}
        </div>

        <aside className="space-y-5 rounded-lg border border-border bg-background p-6">
          <select
            value={settings.materialId}
            onChange={(e) =>
              setSettings((s) => ({ ...s, materialId: e.target.value }))
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <RangeRow
            label="Scale"
            value={settings.scale}
            min={0.25}
            max={3}
            step={0.05}
            suffix="×"
            onChange={(v) => setSettings((s) => ({ ...s, scale: v }))}
          />
          <RangeRow
            label="Infill"
            value={settings.infillPercent}
            min={5}
            max={100}
            step={5}
            suffix="%"
            onChange={(v) => setSettings((s) => ({ ...s, infillPercent: v }))}
          />
          <RangeRow
            label="Walls"
            value={settings.wallCount}
            min={2}
            max={8}
            step={1}
            suffix=""
            onChange={(v) => setSettings((s) => ({ ...s, wallCount: v }))}
          />
          <div>
            <label className="mb-1 block text-xs font-medium">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="border-t border-border pt-4">
            {quote ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-semibold text-primary">
                    {formatCurrency(quote.total * quantity)}
                  </span>
                </div>
                <button
                  onClick={copyQuoteMessage}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy quote for WhatsApp"}
                </button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Upload a file to see the quote.
              </p>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="text-xs font-semibold">Save as order (optional)</h3>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              placeholder="WhatsApp number"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={saveAsOrder}
              disabled={!model || loading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as order
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RangeRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <label className="font-medium">{label}</label>
        <span className="font-mono text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[color:var(--primary)]"
      />
    </div>
  );
}
