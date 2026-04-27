import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/lib/inventory";

export const runtime = "nodejs";

const patchSchema = z
  .object({
    material_id: z.string().min(1),
    brand: z.string().max(80).nullable(),
    color_name: z.string().min(1).max(80),
    color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    spool_capacity_g: z.coerce.number().int().min(50).max(20000),
    remaining_g: z.coerce.number().int().min(0).max(20000),
    cost_per_spool: z.coerce.number().min(0).nullable(),
    supplier: z.string().max(200).nullable(),
    low_stock_g: z.coerce.number().int().min(0).max(20000),
    notes: z.string().max(2000).nullable(),
    archived: z.coerce.number().int().min(0).max(1),
  })
  .partial();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await getInventoryItem(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const patch: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) patch[k] = v as string | number | null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  await updateInventoryItem(id, patch);
  const updated = await getInventoryItem(id);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await getInventoryItem(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteInventoryItem(id);
  return NextResponse.json({ ok: true });
}
