import { formatCurrency } from "@/lib/utils";
import { Boxes } from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl fade-up">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Store</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Prints we've designed and dialed in ourselves. Ready to ship.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="card group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-muted to-muted/40">
              <Boxes className="h-16 w-16 text-muted-foreground/30 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col p-5">
              <h3 className="font-semibold tracking-tight">{p.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {p.blurb}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-lg font-semibold">
                  {formatCurrency(p.price)}
                </span>
                <button className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
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
