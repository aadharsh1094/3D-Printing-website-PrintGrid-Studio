import { formatCurrency } from "@/lib/utils";

const products = [
  {
    id: "benchy-keychain",
    name: "Benchy Keychain",
    price: 199,
    blurb: "The iconic 3D-printer torture test, shrunk down to keychain size.",
  },
  {
    id: "desk-organizer",
    name: "Modular Desk Organizer",
    price: 899,
    blurb: "Snap-fit trays for pens, cables, and the clutter in between.",
  },
  {
    id: "planter-geo",
    name: "Geometric Planter",
    price: 549,
    blurb: "Low-poly aesthetic, high-poly durability. Fits small succulents.",
  },
];

export default function StorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Store</h1>
        <p className="mt-3 text-muted-foreground">
          Prints we've designed and dialed in ourselves. Ready to ship.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background"
          >
            <div className="aspect-square bg-muted" />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {p.blurb}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-lg">
                  {formatCurrency(p.price)}
                </span>
                <button className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
