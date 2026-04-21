import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getOrder, updateOrder } from "@/lib/orders";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import type { OrderStatus } from "@/lib/db";

export const runtime = "nodejs";

async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE.name)?.value;
  return token ? !!(await verifyAdminToken(token)) : false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const admin = await isAdmin();
  if (!admin) {
    const { customer_contact, customer_email, file_path, notes, ...safe } =
      order;
    void customer_contact;
    void customer_email;
    void file_path;
    void notes;
    return NextResponse.json(safe);
  }
  return NextResponse.json(order);
}

const patchSchema = z
  .object({
    status: z.enum([
      "pending",
      "confirmed",
      "printing",
      "completed",
      "delivered",
      "cancelled",
    ]),
    final_price: z.coerce.number().min(0),
    labour_charges: z.coerce.number().min(0),
    discount: z.coerce.number().min(0),
    notes: z.string().max(2000),
    urgent: z.coerce.number().int().min(0).max(1),
    complex: z.coerce.number().int().min(0).max(1),
    quantity: z.coerce.number().int().min(1).max(100),
  })
  .partial();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getOrder(id);
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const patch: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) patch[k] = v as string | number;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  await updateOrder(id, patch as Parameters<typeof updateOrder>[1]);
  const updated = await getOrder(id);
  return NextResponse.json(updated);
}

export type { OrderStatus };
