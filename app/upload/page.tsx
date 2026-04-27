"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type * as THREE from "three";
import { StlViewer, parseStl } from "@/components/stl-viewer";
import { MATERIALS, calculateQuote, type PrintSettings } from "@/lib/quote";
import { formatCurrency } from "@/lib/utils";
import {
  UploadCloud,
  RotateCcw,
  MessageCircle,
  Box,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type LoadedModel = {
  file: File;
  geometry: THREE.BufferGeometry;
  volumeCm3: number;
  bboxCm: { x: number; y: number; z: number };
};

const DEFAULT_SETTINGS: PrintSettings = {
  scale: 1,
  infillPercent: 20,
  wallCount: 3,
  layerHeightMm: 0.2,
  materialId: "pla",
};

export default function UploadPage() {
  const router = useRouter();
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const totalWithQty = quote ? quote.total * quantity : 0;

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      if (!file.name.toLowerCase().endsWith(".stl")) {
        throw new Error("Only .stl files are supported right now.");
      }
      if (file.size > 100 * 1024 * 1024) {
        throw new Error("File too large (100MB max).");
      }
      const parsed = await parseStl(file);
      setModel({ file, ...parsed });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load model.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setModel(null);
    setSettings(DEFAULT_SETTINGS);
    setQuantity(1);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submitOrder() {
    if (!model || !quote) return;
    if (!customerName.trim() || !customerContact.trim()) {
      setError("Please add your name and WhatsApp number to continue.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", model.file);
      fd.append("customerName", customerName.trim());
      fd.append("customerContact", customerContact.trim());
      if (customerEmail.trim()) fd.append("customerEmail", customerEmail.trim());
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
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create order");
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/order/${id}?new=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl fade-up">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Step 1 of 2 · Upload
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
          Get your <span className="gradient-text">instant quote</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Drop your STL, tweak the print settings, and we'll wrap it up on
          WhatsApp.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_440px]">
        <div className="space-y-4">
          {!model ? (
            <label
              htmlFor="stl-upload"
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`flex h-[460px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform ${
                  dragOver ? "scale-110" : ""
                }`}
              >
                {loading ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <UploadCloud className="h-7 w-7" />
                )}
              </div>
              <p className="mt-5 text-base font-medium">
                {loading
                  ? "Parsing your model..."
                  : dragOver
                    ? "Drop it here"
                    : "Drop an STL file"}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                or <span className="font-medium text-primary">click to browse</span>
              </p>
              <p className="mt-6 text-xs text-muted-foreground">
                STL only · Max 100 MB
              </p>
              <input
                ref={inputRef}
                id="stl-upload"
                type="file"
                accept=".stl"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              {error && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </label>
          ) : (
            <div className="fade-up space-y-3">
              <StlViewer
                geometry={model.geometry}
                scale={settings.scale}
                color={material.color}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Box className="h-4 w-4" />
                  <span className="font-medium text-foreground">
                    {model.file.name}
                  </span>
                  <span>·</span>
                  <span className="font-mono">
                    {(model.bboxCm.x * settings.scale).toFixed(1)} ×{" "}
                    {(model.bboxCm.y * settings.scale).toFixed(1)} ×{" "}
                    {(model.bboxCm.z * settings.scale).toFixed(1)} cm
                  </span>
                </div>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Replace
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="card space-y-6 p-6">
          <div>
            <h2 className="text-lg font-semibold">Print settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tune to balance strength, speed, and cost.
            </p>
          </div>

          <Field label="Material">
            <div className="grid grid-cols-2 gap-2">
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    setSettings((s) => ({ ...s, materialId: m.id }))
                  }
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                    settings.materialId === m.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="flex-1 text-left font-medium">{m.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    ₹{m.ratePerGram}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <Slider
            label="Scale"
            value={settings.scale}
            min={0.25}
            max={3}
            step={0.05}
            suffix="×"
            onChange={(v) => setSettings((s) => ({ ...s, scale: v }))}
          />

          <Slider
            label="Infill"
            value={settings.infillPercent}
            min={5}
            max={100}
            step={5}
            suffix="%"
            onChange={(v) =>
              setSettings((s) => ({ ...s, infillPercent: v }))
            }
          />

          <Slider
            label="Wall count"
            value={settings.wallCount}
            min={2}
            max={8}
            step={1}
            suffix=" walls"
            onChange={(v) => setSettings((s) => ({ ...s, wallCount: v }))}
          />

          <Field label="Layer height">
            <select
              value={settings.layerHeightMm}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  layerHeightMm: parseFloat(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value={0.12}>0.12 mm — Fine</option>
              <option value={0.2}>0.20 mm — Standard</option>
              <option value={0.28}>0.28 mm — Draft</option>
            </select>
          </Field>

          <Field label="Quantity">
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <div className="space-y-2 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Your details</h3>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              placeholder="WhatsApp number (with country code)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Email (optional)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2 border-t border-border pt-5">
            {quote ? (
              <>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {quote.breakdown.map((b) => (
                    <div key={b.label} className="flex justify-between">
                      <span>{b.label}</span>
                      <span className="font-mono">
                        {formatCurrency(b.amount)}
                      </span>
                    </div>
                  ))}
                  {quantity > 1 && (
                    <div className="flex justify-between">
                      <span>× {quantity} units</span>
                      <span className="font-mono">
                        {formatCurrency(totalWithQty - quote.total)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-3xl font-bold gradient-text">
                    {formatCurrency(totalWithQty)}
                  </span>
                </div>
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </div>
                )}
                <button
                  onClick={submitOrder}
                  disabled={!model || submitting}
                  className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  {submitting ? "Submitting..." : "Place order via WhatsApp"}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Your order is saved, then you'll be forwarded to WhatsApp to
                  confirm.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Upload a model to see your quote.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Slider({
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
      <div className="mb-2 flex items-center justify-between text-sm">
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
        className="w-full"
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
