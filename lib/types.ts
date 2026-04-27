export type OrderStatus =
  | "pending"
  | "confirmed"
  | "printing"
  | "completed"
  | "delivered"
  | "cancelled";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  printing: "Printing",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "printing",
  "completed",
  "delivered",
];

export type InventoryItem = {
  id: string;
  material_id: string;
  brand: string | null;
  color_name: string;
  color_hex: string;
  spool_capacity_g: number;
  remaining_g: number;
  cost_per_spool: number | null;
  supplier: string | null;
  low_stock_g: number;
  notes: string | null;
  archived: number;
  created_at: number;
  updated_at: number;
};

export type OrderRow = {
  id: string;
  customer_name: string;
  customer_contact: string;
  customer_email: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  volume_cm3: number;
  bbox_x: number;
  bbox_y: number;
  bbox_z: number;
  material_id: string;
  scale: number;
  infill_percent: number;
  wall_count: number;
  layer_height_mm: number;
  quantity: number;
  quoted_price: number;
  final_price: number;
  labour_charges: number;
  discount: number;
  status: OrderStatus;
  notes: string | null;
  urgent: number;
  complex: number;
  source: string;
  created_at: number;
  updated_at: number;
};
