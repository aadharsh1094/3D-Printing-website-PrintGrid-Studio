import { listInventory } from "@/lib/inventory";
import { MATERIALS } from "@/lib/quote";
import { InventoryManager } from "./inventory-manager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const items = await listInventory(true);
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your filament spools. Items below the low-stock threshold are
          highlighted on the dashboard.
        </p>
      </div>
      <InventoryManager initialItems={items} materials={MATERIALS} />
    </div>
  );
}
