import Link from "next/link";
import { Boxes } from "lucide-react";

const links = [
  { href: "/upload", label: "Upload & Quote" },
  { href: "/store", label: "Store" },
  { href: "/orders", label: "My Orders" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Boxes className="h-6 w-6 text-primary" />
          <span className="text-lg tracking-tight">PrintGrid Studio</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/upload"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get a quote
        </Link>
      </div>
    </header>
  );
}
