import { getDb } from "./db";
import type { InventoryItem } from "./types";
import { randomBytes } from "node:crypto";

function newId() {
  return "INV-" + randomBytes(4).toString("hex").toUpperCase();
}

export async function listInventory(includeArchived = false): Promise<InventoryItem[]> {
  const db = getDb();
  const sql = includeArchived
    ? "SELECT * FROM inventory ORDER BY material_id, color_name"
    : "SELECT * FROM inventory WHERE archived = 0 ORDER BY material_id, color_name";
  const result = await db.execute(sql);
  return result.rows as unknown as InventoryItem[];
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  const db = getDb();
  const r = await db.execute({
    sql: "SELECT * FROM inventory WHERE id = ?",
    args: [id],
  });
  return r.rows[0] ? (r.rows[0] as unknown as InventoryItem) : null;
}

export type CreateInventoryInput = {
  material_id: string;
  brand?: string;
  color_name: string;
  color_hex?: string;
  spool_capacity_g: number;
  remaining_g: number;
  cost_per_spool?: number;
  supplier?: string;
  low_stock_g?: number;
  notes?: string;
};

export async function createInventoryItem(input: CreateInventoryInput) {
  const db = getDb();
  const id = newId();
  const now = Date.now();
  await db.execute({
    sql: `INSERT INTO inventory (
      id, material_id, brand, color_name, color_hex,
      spool_capacity_g, remaining_g, cost_per_spool,
      supplier, low_stock_g, notes,
      created_at, updated_at
    ) VALUES (?,?,?,?,?, ?,?,?, ?,?,?, ?,?)`,
    args: [
      id,
      input.material_id,
      input.brand ?? null,
      input.color_name,
      input.color_hex ?? "#888888",
      input.spool_capacity_g,
      input.remaining_g,
      input.cost_per_spool ?? null,
      input.supplier ?? null,
      input.low_stock_g ?? 100,
      input.notes ?? null,
      now,
      now,
    ],
  });
  return id;
}

export type InventoryPatch = Partial<
  Pick<
    InventoryItem,
    | "material_id"
    | "brand"
    | "color_name"
    | "color_hex"
    | "spool_capacity_g"
    | "remaining_g"
    | "cost_per_spool"
    | "supplier"
    | "low_stock_g"
    | "notes"
    | "archived"
  >
>;

export async function updateInventoryItem(id: string, patch: InventoryPatch) {
  const db = getDb();
  const keys = Object.keys(patch) as (keyof InventoryPatch)[];
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = ?`).join(", ");
  const args = keys.map((k) => patch[k] as string | number | null);
  args.push(Date.now());
  args.push(id);
  await db.execute({
    sql: `UPDATE inventory SET ${sets}, updated_at = ? WHERE id = ?`,
    args,
  });
}

export async function decrementStock(id: string, grams: number) {
  const db = getDb();
  await db.execute({
    sql: `UPDATE inventory
          SET remaining_g = MAX(0, remaining_g - ?), updated_at = ?
          WHERE id = ?`,
    args: [grams, Date.now(), id],
  });
}

export async function deleteInventoryItem(id: string) {
  const db = getDb();
  await db.execute({ sql: "DELETE FROM inventory WHERE id = ?", args: [id] });
}

export async function getInventorySummary() {
  const db = getDb();
  const [totals, low] = await Promise.all([
    db.execute(
      `SELECT material_id,
              COUNT(*) as spools,
              SUM(remaining_g) as remaining,
              SUM(spool_capacity_g) as capacity
       FROM inventory WHERE archived = 0
       GROUP BY material_id`
    ),
    db.execute(
      `SELECT COUNT(*) as n FROM inventory
       WHERE archived = 0 AND remaining_g <= low_stock_g`
    ),
  ]);
  const byMaterial = totals.rows.map((r) => ({
    material_id: r.material_id as string,
    spools: Number(r.spools),
    remaining: Number(r.remaining),
    capacity: Number(r.capacity),
  }));
  return {
    byMaterial,
    lowStockCount: Number(low.rows[0]?.n ?? 0),
    totalRemaining: byMaterial.reduce((a, b) => a + b.remaining, 0),
  };
}
