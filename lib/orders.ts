import { getDb, type OrderRow, type OrderStatus } from "./db";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), ".data", "uploads");

export function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `PG-${ts}${rand}`;
}

export function uploadDirFor(orderId: string) {
  return path.join(UPLOADS_DIR, orderId);
}

export async function saveUpload(orderId: string, file: File) {
  const dir = uploadDirFor(orderId);
  fs.mkdirSync(dir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(dir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  return { filePath, fileName: safeName, fileSize: buffer.byteLength };
}

export type CreateOrderInput = {
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  volumeCm3: number;
  bbox: { x: number; y: number; z: number };
  materialId: string;
  scale: number;
  infillPercent: number;
  wallCount: number;
  layerHeightMm: number;
  quantity: number;
  quotedPrice: number;
  source?: "web" | "admin_quick_quote";
};

export async function insertOrder(input: CreateOrderInput, existingId?: string) {
  const db = getDb();
  const id = existingId ?? generateOrderId();
  const now = Date.now();
  await db.execute({
    sql: `INSERT INTO orders (
      id, customer_name, customer_contact, customer_email,
      file_name, file_path, file_size,
      volume_cm3, bbox_x, bbox_y, bbox_z,
      material_id, scale, infill_percent, wall_count, layer_height_mm,
      quantity, quoted_price, final_price,
      status, source, created_at, updated_at
    ) VALUES (?,?,?,?, ?,?,?, ?,?,?,?, ?,?,?,?,?, ?,?,?, ?,?,?,?)`,
    args: [
      id,
      input.customerName,
      input.customerContact,
      input.customerEmail ?? null,
      input.fileName,
      input.filePath,
      input.fileSize,
      input.volumeCm3,
      input.bbox.x,
      input.bbox.y,
      input.bbox.z,
      input.materialId,
      input.scale,
      input.infillPercent,
      input.wallCount,
      input.layerHeightMm,
      input.quantity,
      input.quotedPrice,
      input.quotedPrice,
      "pending",
      input.source ?? "web",
      now,
      now,
    ],
  });
  return id;
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM orders WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as OrderRow;
}

export async function listOrders(): Promise<OrderRow[]> {
  const db = getDb();
  const result = await db.execute(
    "SELECT * FROM orders ORDER BY created_at DESC"
  );
  return result.rows as unknown as OrderRow[];
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<
      OrderRow,
      | "status"
      | "final_price"
      | "labour_charges"
      | "discount"
      | "notes"
      | "urgent"
      | "complex"
      | "quantity"
    >
  >
) {
  const db = getDb();
  const keys = Object.keys(patch) as (keyof typeof patch)[];
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = ?`).join(", ");
  const args = keys.map((k) => patch[k] as string | number);
  args.push(Date.now());
  args.push(id);
  await db.execute({
    sql: `UPDATE orders SET ${sets}, updated_at = ? WHERE id = ?`,
    args,
  });
}

export async function getAnalytics() {
  const db = getDb();
  const [counts, revenue, materials] = await Promise.all([
    db.execute(`SELECT status, COUNT(*) as n FROM orders GROUP BY status`),
    db.execute(
      `SELECT COALESCE(SUM(final_price * quantity), 0) as total,
              COALESCE(AVG(final_price * quantity), 0) as avg,
              COUNT(*) as n
       FROM orders WHERE status IN ('completed','delivered')`
    ),
    db.execute(
      `SELECT material_id, COUNT(*) as n FROM orders GROUP BY material_id ORDER BY n DESC LIMIT 1`
    ),
  ]);
  const statusCounts: Record<string, number> = {};
  for (const r of counts.rows) {
    statusCounts[r.status as string] = Number(r.n);
  }
  const rev = revenue.rows[0];
  return {
    statusCounts,
    totalOrders: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    totalRevenue: Number(rev?.total ?? 0),
    avgOrderValue: Number(rev?.avg ?? 0),
    completedCount: Number(rev?.n ?? 0),
    topMaterial: (materials.rows[0]?.material_id as string | undefined) ?? null,
  };
}

export function computeFinalPrice(order: OrderRow) {
  const base = order.final_price;
  const labour = order.labour_charges ?? 0;
  const discount = order.discount ?? 0;
  return Math.max(0, (base + labour) * order.quantity - discount);
}
