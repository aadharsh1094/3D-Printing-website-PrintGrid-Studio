export type Material = {
  id: string;
  name: string;
  density: number;
  ratePerGram: number;
  color: string;
};

export const MATERIALS: Material[] = [
  { id: "pla", name: "PLA", density: 1.24, ratePerGram: 3.5, color: "#ff5a1f" },
  { id: "petg", name: "PETG", density: 1.27, ratePerGram: 4.5, color: "#2ecc71" },
  { id: "abs", name: "ABS", density: 1.04, ratePerGram: 4.0, color: "#3498db" },
  { id: "tpu", name: "TPU (Flexible)", density: 1.21, ratePerGram: 7.0, color: "#9b59b6" },
];

export type PrintSettings = {
  scale: number;
  infillPercent: number;
  wallCount: number;
  layerHeightMm: number;
  materialId: string;
};

export type QuoteInput = {
  volumeCm3: number;
  bboxCm: { x: number; y: number; z: number };
  settings: PrintSettings;
};

export type Quote = {
  weightGrams: number;
  materialCost: number;
  printTimeHours: number;
  laborCost: number;
  subtotal: number;
  total: number;
  breakdown: { label: string; amount: number }[];
};

const BASE_FEE = 50;
const HOURLY_RATE = 40;
const MARKUP = 1.2;
const PRINT_CM3_PER_HOUR = 15;

export function calculateQuote({
  volumeCm3,
  settings,
}: QuoteInput): Quote {
  const material =
    MATERIALS.find((m) => m.id === settings.materialId) ?? MATERIALS[0];

  const scaleFactor = settings.scale ** 3;
  const effectiveVolume = volumeCm3 * scaleFactor;

  const infillFactor = 0.15 + 0.85 * (settings.infillPercent / 100);
  const wallFactor = 1 + (settings.wallCount - 2) * 0.05;
  const layerFactor = 0.2 / settings.layerHeightMm;

  const weightGrams = effectiveVolume * material.density * infillFactor * wallFactor;
  const materialCost = weightGrams * material.ratePerGram;

  const printTimeHours =
    (effectiveVolume / PRINT_CM3_PER_HOUR) * layerFactor * (0.8 + infillFactor * 0.5);
  const laborCost = BASE_FEE + printTimeHours * HOURLY_RATE;

  const subtotal = materialCost + laborCost;
  const total = subtotal * MARKUP;

  return {
    weightGrams,
    materialCost,
    printTimeHours,
    laborCost,
    subtotal,
    total,
    breakdown: [
      { label: `Material (${material.name}, ${weightGrams.toFixed(1)} g)`, amount: materialCost },
      { label: `Print time (~${printTimeHours.toFixed(1)} h)`, amount: laborCost },
      { label: "Service & handling", amount: total - subtotal },
    ],
  };
}
