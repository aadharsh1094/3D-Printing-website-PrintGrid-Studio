import Link from "next/link";
import {
  Upload,
  Settings2,
  CreditCard,
  Truck,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your model",
    body: "Drop an STL and preview it in 3D. Scale, inspect, validate — all in your browser.",
  },
  {
    icon: Settings2,
    title: "Dial in the print",
    body: "Pick a material, set infill and walls. Watch the price update live.",
  },
  {
    icon: CreditCard,
    title: "Confirm via WhatsApp",
    body: "We chat to confirm timeline and details, then lock in your slot.",
  },
  {
    icon: Truck,
    title: "Print & ship",
    body: "We print, finish, and ship — with status updates the whole way.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Quality, not quantity",
    body: "Every print is tuned, inspected, and finished by hand before it ships.",
  },
  {
    icon: Clock,
    title: "Fast turnaround",
    body: "Most orders ship within 3–5 days. Urgent jobs? Tell us — we'll prioritize.",
  },
  {
    icon: Sparkles,
    title: "Wide material range",
    body: "PLA, PETG, ABS, TPU. From everyday prototypes to flexible functional parts.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="hero-bg relative border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="max-w-3xl fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Custom 3D printing
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
              Your idea.
              <br />
              Our printer.
              <br />
              <span className="gradient-text">Delivered.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Upload an STL, configure your print, and get a real-time quote.
              We handle the printing, finishing, and shipping — so you can stay
              focused on building.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg"
              >
                Upload a model
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/store"
                className="inline-flex h-12 items-center rounded-lg border border-border bg-background px-6 text-sm font-medium hover:bg-muted"
              >
                Browse the store
              </Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-8 border-t border-border pt-8">
              <Stat label="Materials" value="4+" />
              <Stat label="Build volume" value="25 cm³" />
              <Stat label="Avg turnaround" value="3–5 d" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Four simple steps from your file to your doorstep.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="card group p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-16 sm:flex-row sm:px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Ready to print something cool?
            </h2>
            <p className="mt-2 text-sm opacity-70">
              Upload your model, get a quote, and we'll handle the rest.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md transition-all hover:opacity-90"
          >
            Start your order
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
