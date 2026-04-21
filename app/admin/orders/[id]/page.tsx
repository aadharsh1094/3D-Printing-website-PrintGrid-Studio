import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/orders";
import { MATERIALS } from "@/lib/quote";
import { formatCurrency } from "@/lib/utils";
import { OrderEditor } from "./order-editor";
import { ArrowLeft, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const material = MATERIALS.find((m) => m.id === order.material_id);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl text-muted-foreground">{order.id}</h1>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {order.customer_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.customer_contact}
            {order.customer_email ? ` · ${order.customer_email}` : null}
            {" · "}
            {new Date(order.created_at).toLocaleString("en-IN")}
          </p>
        </div>
        <a
          href={`/api/orders/${order.id}/file`}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Download {order.file_name}
        </a>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 text-sm font-semibold">Configuration</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <Row k="Material" v={material?.name ?? order.material_id} />
              <Row k="Scale" v={`${order.scale}×`} />
              <Row k="Infill" v={`${order.infill_percent}%`} />
              <Row k="Walls" v={String(order.wall_count)} />
              <Row k="Layer" v={`${order.layer_height_mm} mm`} />
              <Row k="Quantity" v={String(order.quantity)} />
              <Row
                k="Size (cm)"
                v={`${(order.bbox_x * order.scale).toFixed(1)} × ${(order.bbox_y * order.scale).toFixed(1)} × ${(order.bbox_z * order.scale).toFixed(1)}`}
              />
              <Row
                k="Volume"
                v={`${(order.volume_cm3 * Math.pow(order.scale, 3)).toFixed(1)} cm³`}
              />
              <Row k="File size" v={`${(order.file_size / 1024).toFixed(0)} KB`} />
            </dl>
          </section>

          <OrderEditor order={order} />
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 text-sm font-semibold">Price breakdown</h2>
            <PriceSummary order={order} />
          </section>
          <section className="rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 text-sm font-semibold">Original quote</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quoted at submit</span>
              <span className="font-mono">
                {formatCurrency(order.quoted_price)}
              </span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="col-span-1 font-mono sm:col-span-2">{v}</dd>
    </>
  );
}

function PriceSummary({
  order,
}: {
  order: Awaited<ReturnType<typeof getOrder>> & object;
}) {
  const unit = order.final_price;
  const labour = order.labour_charges;
  const discount = order.discount;
  const qty = order.quantity;
  const total = (unit + labour) * qty - discount;
  return (
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Unit price</dt>
        <dd className="font-mono">{formatCurrency(unit)}</dd>
      </div>
      {labour > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">+ Labour</dt>
          <dd className="font-mono">{formatCurrency(labour)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">× Quantity</dt>
        <dd className="font-mono">{qty}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">− Discount</dt>
          <dd className="font-mono">{formatCurrency(discount)}</dd>
        </div>
      )}
      <div className="mt-2 flex justify-between border-t border-border pt-2">
        <dt className="font-medium">Total</dt>
        <dd className="font-mono text-lg font-semibold text-primary">
          {formatCurrency(total)}
        </dd>
      </div>
    </dl>
  );
}
