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
  algorithm: PricingAlgorithm;
};

export type PricingAlgorithm = "volumetric" | "per_gram" | "machine_time";

export const PRICING_OPTIONS: {
  id: PricingAlgorithm;
  name: string;
  blurb: string;
  bestFor: string;
}[] = [
  {
    id: "volumetric",
    name: "Volumetric (default)",
    blurb:
      "Computes weight from STL volume × density × infill, adds time-based labour, applies a service markup.",
    bestFor:
      "Most parts. Strikes a balance between material and machine time, and rewards efficient infill.",
  },
  {
    id: "per_gram",
    name: "Flat per-gram",
    blurb:
      "Just weight × per-gram rate + a fixed handling fee. Doesn't price machine time separately.",
    bestFor:
      "Simple, predictable quotes. Good if you want customers to optimize for material weight only.",
  },
  {
    id: "machine_time",
    name: "Machine-time",
    blurb:
      "Estimates print hours from volume and layer height, charges per machine-hour + material cost.",
    bestFor:
      "Service bureaus where printer time is the bottleneck. Fine prints get expensive (slow), draft cheap.",
  },
];

export const ACTIVE_PRICING_ALGORITHM: PricingAlgorithm = "volumetric";

const BASE_FEE = 50;
const HOURLY_RATE = 40;
const MARKUP = 1.2;
const PRINT_CM3_PER_HOUR = 15;

const FLAT_HANDLING = 80;
const FLAT_PER_GRAM_MARKUP = 1.6;

const MACHINE_HOURLY = 90;
const MACHINE_HANDLING = 60;

export function calculateQuote(
  input: QuoteInput,
  algorithm: PricingAlgorithm = ACTIVE_PRICING_ALGORITHM
): Quote {
  const material =
    MATERIALS.find((m) => m.id === input.settings.materialId) ?? MATERIALS[0];
  const scaleFactor = input.settings.scale ** 3;
  const effectiveVolume = input.volumeCm3 * scaleFactor;
  const infillFactor = 0.15 + 0.85 * (input.settings.infillPercent / 100);
  const wallFactor = 1 + (input.settings.wallCount - 2) * 0.05;
  const weightGrams = effectiveVolume * material.density * infillFactor * wallFactor;

  const layerFactor = 0.2 / input.settings.layerHeightMm;
  const printTimeHours =
    (effectiveVolume / PRINT_CM3_PER_HOUR) *
    layerFactor *
    (0.8 + infillFactor * 0.5);

  switch (algorithm) {
    case "per_gram":
      return computePerGram(weightGrams, printTimeHours, material);
    case "machine_time":
      return computeMachineTime(weightGrams, printTimeHours, material);
    case "volumetric":
    default:
      return computeVolumetric(weightGrams, printTimeHours, material);
  }
}

function computeVolumetric(
  weightGrams: number,
  printTimeHours: number,
  material: Material
): Quote {
  const materialCost = weightGrams * material.ratePerGram;
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
    algorithm: "volumetric",
    breakdown: [
      {
        label: `Material (${material.name}, ${weightGrams.toFixed(1)} g)`,
        amount: materialCost,
      },
      {
        label: `Print time (~${printTimeHours.toFixed(1)} h)`,
        amount: laborCost,
      },
      { label: "Service & handling", amount: total - subtotal },
    ],
  };
}

function computePerGram(
  weightGrams: number,
  printTimeHours: number,
  material: Material
): Quote {
  const materialCost = weightGrams * material.ratePerGram * FLAT_PER_GRAM_MARKUP;
  const laborCost = FLAT_HANDLING;
  const subtotal = materialCost + laborCost;
  const total = subtotal;
  return {
    weightGrams,
    materialCost,
    printTimeHours,
    laborCost,
    subtotal,
    total,
    algorithm: "per_gram",
    breakdown: [
      {
        label: `${material.name} × ${weightGrams.toFixed(1)} g`,
        amount: materialCost,
      },
      { label: "Handling fee", amount: laborCost },
    ],
  };
}

function computeMachineTime(
  weightGrams: number,
  printTimeHours: number,
  material: Material
): Quote {
  const materialCost = weightGrams * material.ratePerGram;
  const laborCost = printTimeHours * MACHINE_HOURLY + MACHINE_HANDLING;
  const subtotal = materialCost + laborCost;
  const total = subtotal;
  return {
    weightGrams,
    materialCost,
    printTimeHours,
    laborCost,
    subtotal,
    total,
    algorithm: "machine_time",
    breakdown: [
      {
        label: `Material (${weightGrams.toFixed(1)} g)`,
        amount: materialCost,
      },
      {
        label: `Machine time (${printTimeHours.toFixed(1)} h × ₹${MACHINE_HOURLY})`,
        amount: laborCost - MACHINE_HANDLING,
      },
      { label: "Setup & post-processing", amount: MACHINE_HANDLING },
    ],
  };
}
