export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">My Orders</h1>
      <p className="mt-3 text-muted-foreground">
        Track the status of your prints from slicer to doorstep.
      </p>

      <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">
          You don't have any orders yet.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once you place an order, you'll be able to track its progress here.
        </p>
      </div>
    </div>
  );
}
