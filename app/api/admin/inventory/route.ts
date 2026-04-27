import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listInventory, createInventoryItem } from "@/lib/inventory";
import { MATERIALS } from "@/lib/quote";

export const runtime = "nodejs";

export async function GET() {
  const items = await listInventory(true);
  return NextResponse.json({ items });
}

const schema = z.object({
  material_id: z.string().refine((v) => MATERIALS.some((m) => m.id === v), {
    message: "Unknown material",
  }),
  brand: z.string().max(80).optional(),
  color_name: z.string().min(1).max(80),
  color_hex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  spool_capacity_g: z.coerce.number().int().min(50).max(20000),
  remaining_g: z.coerce.number().int().min(0).max(20000),
  cost_per_spool: z.coerce.number().min(0).optional(),
  supplier: z.string().max(200).optional(),
  low_stock_g: z.coerce.number().int().min(0).max(20000).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const id = await createInventoryItem(parsed.data);
  return NextResponse.json({ id });
}
