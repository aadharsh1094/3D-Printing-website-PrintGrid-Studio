import { createClient, type Client } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";

export {
  type OrderStatus,
  type OrderRow,
  STATUS_LABELS,
  STATUS_FLOW,
} from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "printgrid.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let client: Client | null = null;
let initialized = false;

export function getDb(): Client {
  if (!client) {
    client = createClient({ url: `file:${DB_PATH}` });
  }
  if (!initialized) {
    initSchema(client);
    initialized = true;
  }
  return client;
}

function initSchema(c: Client) {
  c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_contact TEXT NOT NULL,
      customer_email TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      volume_cm3 REAL NOT NULL,
      bbox_x REAL NOT NULL,
      bbox_y REAL NOT NULL,
      bbox_z REAL NOT NULL,
      material_id TEXT NOT NULL,
      scale REAL NOT NULL,
      infill_percent INTEGER NOT NULL,
      wall_count INTEGER NOT NULL,
      layer_height_mm REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      quoted_price REAL NOT NULL,
      final_price REAL NOT NULL,
      labour_charges REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      urgent INTEGER NOT NULL DEFAULT 0,
      complex INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'web',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
  `);
}
