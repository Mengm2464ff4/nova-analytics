import Link from "next/link";
import { BarChart3 } from "lucide-react";

const LINKS = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#docs", label: "Docs" },
    { href: "/#changelog", label: "Changelog" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/dpa", label: "DPA" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5 text-primary" />
            Nova Analytics
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Privacy-first web analytics. Self-hostable, cookie-free, real-time.
          </p>
        </div>

        {Object.entries(LINKS).map(([section, items]) => (
          <div key={section}>
            <h4 className="text-sm font-semibold">{section}</h4>
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Nova Analytics. All rights reserved.</p>
          <p>Made with respect for your users&apos; privacy.</p>
        </div>
      </div>
    </footer>
  );
}