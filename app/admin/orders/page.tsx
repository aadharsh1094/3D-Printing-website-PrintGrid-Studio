import { listOrders } from "@/lib/orders";
import { OrdersTable } from "./orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <span className="text-sm text-muted-foreground">
          {orders.length} total
        </span>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
