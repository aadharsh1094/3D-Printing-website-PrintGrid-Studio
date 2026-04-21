"use client";

import { useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import { StlViewer, parseStl } from "@/components/stl-viewer";
import { MATERIALS, calculateQuote, type PrintSettings } from "@/lib/quote";
import { formatCurrency } from "@/lib/utils";
import { UploadCloud, RotateCcw, ArrowRight } from "lucide-react";

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
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
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

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      if (!file.name.toLowerCase().endsWith(".stl")) {
        throw new Error("Only .stl files are supported right now.");
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
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Upload & quote</h1>
        <p className="mt-3 text-muted-foreground">
          Drop your STL, tweak the print settings, and see the price update live.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {!model ? (
            <label
              htmlFor="stl-upload"
              className="flex h-[420px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-medium">
                {loading ? "Parsing model..." : "Drop an STL file or click to browse"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Max 100MB • STL only (OBJ/3MF coming soon)
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
              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </label>
          ) : (
            <>
              <StlViewer
                geometry={model.geometry}
                scale={settings.scale}
                color={material.color}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">{model.file.name}</span>
                  {" · "}
                  {(model.bboxCm.x * settings.scale).toFixed(1)} ×{" "}
                  {(model.bboxCm.y * settings.scale).toFixed(1)} ×{" "}
                  {(model.bboxCm.z * settings.scale).toFixed(1)} cm
                </div>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 hover:bg-muted"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Upload a different file
                </button>
              </div>
            </>
          )}
        </div>

        <aside className="space-y-6 rounded-lg border border-border bg-background p-6">
          <div>
            <h2 className="text-lg font-semibold">Print settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tune these to balance strength, speed, and cost.
            </p>
          </div>

          <Field label="Material">
            <select
              value={settings.materialId}
              onChange={(e) =>
                setSettings((s) => ({ ...s, materialId: e.target.value }))
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — ₹{m.ratePerGram.toFixed(1)}/g
                </option>
              ))}
            </select>
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
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value={0.12}>0.12 mm — Fine</option>
              <option value={0.2}>0.20 mm — Standard</option>
              <option value={0.28}>0.28 mm — Draft</option>
            </select>
          </Field>

          <div className="space-y-2 border-t border-border pt-5">
            {quote ? (
              <>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {quote.breakdown.map((b) => (
                    <div key={b.label} className="flex justify-between">
                      <span>{b.label}</span>
                      <span className="font-mono">{formatCurrency(b.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-2xl font-semibold text-primary">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
                <button
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  disabled={!model}
                >
                  Continue to checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
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
      <div className="mb-1.5 flex items-center justify-between text-sm">
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
