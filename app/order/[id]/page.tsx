import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { STATUS_FLOW, STATUS_LABELS, type OrderStatus } from "@/lib/db";
import { MATERIALS } from "@/lib/quote";
import { formatCurrency } from "@/lib/utils";
import { WhatsAppRedirect } from "./whatsapp-redirect";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const order = await getOrder(id);
  if (!order) notFound();

  const isNew = sp.new === "1";
  const material = MATERIALS.find((m) => m.id === order.material_id);
  const total = (order.final_price + order.labour_charges) * order.quantity - order.discount;

  const waNumber = process.env.WHATSAPP_PHONE ?? "";
  const waMessage = buildWhatsAppMessage(order, total);

  const currentIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {isNew && waNumber && (
        <WhatsAppRedirect
          url={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`}
        />
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-mono text-muted-foreground">Order {order.id}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {isNew ? "Order received — let's confirm on WhatsApp" : "Order details"}
          </h1>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      {isNew && (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <p className="font-medium">Almost done.</p>
          <p className="mt-1 text-muted-foreground">
            {waNumber
              ? "We're opening WhatsApp now with your order summary. Send the message to lock in your slot. If it didn't open, tap the button below."
              : "Your order is saved. We'll be in touch shortly."}
          </p>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-[#25D366] px-4 text-sm font-medium text-white"
            >
              Open WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Progress">
            <ol className="space-y-4">
              {STATUS_FLOW.map((s, i) => {
                const done = currentIdx >= i && order.status !== "cancelled";
                const active = currentIdx === i;
                return (
                  <li key={s} className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    ) : active ? (
                      <Clock className="mt-0.5 h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 text-muted-foreground/40" />
                    )}
                    <div>
                      <p
                        className={
                          done
                            ? "font-medium"
                            : "font-medium text-muted-foreground"
                        }
                      >
                        {STATUS_LABELS[s]}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Print configuration">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Row k="File" v={order.file_name} />
              <Row k="Material" v={material?.name ?? order.material_id} />
              <Row
                k="Size"
                v={`${(order.bbox_x * order.scale).toFixed(1)} × ${(order.bbox_y * order.scale).toFixed(1)} × ${(order.bbox_z * order.scale).toFixed(1)} cm`}
              />
              <Row k="Scale" v={`${order.scale}×`} />
              <Row k="Infill" v={`${order.infill_percent}%`} />
              <Row k="Walls" v={String(order.wall_count)} />
              <Row k="Layer height" v={`${order.layer_height_mm} mm`} />
              <Row k="Quantity" v={String(order.quantity)} />
            </dl>
          </Card>
        </div>

        <aside className="space-y-3 rounded-lg border border-border bg-background p-6">
          <h2 className="text-sm font-semibold">Summary</h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <Line k={`Unit price`} v={formatCurrency(order.final_price)} />
            {order.labour_charges > 0 && (
              <Line k="Labour" v={formatCurrency(order.labour_charges)} />
            )}
            {order.quantity > 1 && (
              <Line k="Quantity" v={`× ${order.quantity}`} />
            )}
            {order.discount > 0 && (
              <Line k="Discount" v={`− ${formatCurrency(order.discount)}`} />
            )}
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-semibold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
          {waNumber && !isNew && (
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, checking on my order ${order.id}`)}`}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Ping us on WhatsApp
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}

function buildWhatsAppMessage(
  order: Awaited<ReturnType<typeof getOrder>> & object,
  total: number
) {
  const material = MATERIALS.find((m) => m.id === order.material_id);
  return [
    `Hi PrintGrid Studio, I just placed order ${order.id}.`,
    ``,
    `Name: ${order.customer_name}`,
    `File: ${order.file_name}`,
    `Material: ${material?.name ?? order.material_id}`,
    `Size: ${(order.bbox_x * order.scale).toFixed(1)} × ${(order.bbox_y * order.scale).toFixed(1)} × ${(order.bbox_z * order.scale).toFixed(1)} cm`,
    `Infill: ${order.infill_percent}% | Walls: ${order.wall_count} | Layer: ${order.layer_height_mm} mm`,
    `Quantity: ${order.quantity}`,
    `Total: ₹${Math.round(total)}`,
    ``,
    `Please confirm when you're ready to print.`,
  ].join("\n");
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-background p-6">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-mono text-right">{v}</dd>
    </>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span>{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const palette: Record<OrderStatus, string> = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    printing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    delivered: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${palette[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
