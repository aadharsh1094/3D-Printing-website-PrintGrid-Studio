import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="fade-up">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          My Orders
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Track the status of your prints from slicer to doorstep.
        </p>
      </div>

      <div className="mt-10 card flex flex-col items-center p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Package className="h-7 w-7" />
        </div>
        <p className="mt-5 font-medium">Your orders will appear here.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once you place an order, you'll be able to track its progress here.
        </p>
        <Link
          href="/upload"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Place your first order
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
