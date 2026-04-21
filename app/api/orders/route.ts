import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { insertOrder, saveUpload, generateOrderId } from "@/lib/orders";
import { calculateQuote, MATERIALS } from "@/lib/quote";

export const runtime = "nodejs";

const MAX_FILE_MB = 100;

const schema = z.object({
  customerName: z.string().min(1).max(120),
  customerContact: z.string().min(5).max(50),
  customerEmail: z.string().email().optional().or(z.literal("")),
  materialId: z.string(),
  scale: z.coerce.number().min(0.1).max(10),
  infillPercent: z.coerce.number().min(0).max(100),
  wallCount: z.coerce.number().int().min(1).max(12),
  layerHeightMm: z.coerce.number().min(0.05).max(0.6),
  quantity: z.coerce.number().int().min(1).max(100),
  volumeCm3: z.coerce.number().positive(),
  bboxX: z.coerce.number().positive(),
  bboxY: z.coerce.number().positive(),
  bboxZ: z.coerce.number().positive(),
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_FILE_MB}MB)` },
      { status: 413 }
    );
  }
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".stl") && !lower.endsWith(".obj")) {
    return NextResponse.json(
      { error: "Only .stl and .obj files are allowed" },
      { status: 415 }
    );
  }

  const fields = Object.fromEntries(
    Array.from(form.entries())
      .filter(([k]) => k !== "file")
      .map(([k, v]) => [k, typeof v === "string" ? v : ""])
  );
  const parsed = schema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order fields", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (!MATERIALS.find((m) => m.id === data.materialId)) {
    return NextResponse.json({ error: "Unknown material" }, { status: 400 });
  }

  const quote = calculateQuote({
    volumeCm3: data.volumeCm3,
    bboxCm: { x: data.bboxX, y: data.bboxY, z: data.bboxZ },
    settings: {
      scale: data.scale,
      infillPercent: data.infillPercent,
      wallCount: data.wallCount,
      layerHeightMm: data.layerHeightMm,
      materialId: data.materialId,
    },
  });

  const orderId = generateOrderId();
  const saved = await saveUpload(orderId, file);

  await insertOrder(
    {
      customerName: data.customerName,
      customerContact: data.customerContact,
      customerEmail: data.customerEmail || undefined,
      fileName: saved.fileName,
      filePath: saved.filePath,
      fileSize: saved.fileSize,
      volumeCm3: data.volumeCm3,
      bbox: { x: data.bboxX, y: data.bboxY, z: data.bboxZ },
      materialId: data.materialId,
      scale: data.scale,
      infillPercent: data.infillPercent,
      wallCount: data.wallCount,
      layerHeightMm: data.layerHeightMm,
      quantity: data.quantity,
      quotedPrice: quote.total,
    },
    orderId
  );

  return NextResponse.json({ id: orderId, quote });
}
