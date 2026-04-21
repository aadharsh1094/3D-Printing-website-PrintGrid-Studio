import Link from "next/link";
import { Upload, Settings2, CreditCard, Truck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your model",
    body: "Drop an STL file and preview it in 3D. Scale, rotate, and inspect before you print.",
  },
  {
    icon: Settings2,
    title: "Dial in the settings",
    body: "Choose material, infill, wall count, and layer height. We'll quote you instantly.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    body: "Checkout through a secure payment gateway. Your file is locked in the moment you pay.",
  },
  {
    icon: Truck,
    title: "Print & ship",
    body: "We print, clean up, and ship it to your door — with updates every step of the way.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Custom 3D printing, on demand
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Your idea. Our printer.{" "}
              <span className="text-primary">Delivered.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Upload an STL, configure your print, and get a real-time quote. We
              handle the printing, finishing, and shipping — so you can stay
              focused on building.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Upload a model
              </Link>
              <Link
                href="/store"
                className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium hover:bg-muted"
              >
                Browse the store
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            Four simple steps from your file to your doorstep.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-lg border border-border bg-background p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
