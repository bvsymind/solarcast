import Link from "next/link";
import { Sun, Github, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";

const footerLinks = {
  product: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "#features", label: "Features" },
    { href: "#technology", label: "Technology" },
  ],
  resources: [
    { href: "https://open-meteo.com", label: "Open-Meteo API" },
    { href: "https://maplibre.org", label: "MapLibre GL" },
    { href: "https://nominatim.org", label: "Nominatim" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-surface-secondary">
      <Container>
        {/* Top row */}
        <div className="grid gap-8 py-12 sm:gap-10 sm:py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Sun className="h-7 w-7 text-primary-500" />
              <span className="text-lg font-bold tracking-tight">
                Solarcast
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              Renewable Energy Potential Dashboard for engineers and
              researchers. Powered by open data and open-source software.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-primary-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-primary-500"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* GitHub CTA */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Open Source
            </h4>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-card transition-all hover:border-primary-200 hover:text-primary-600 hover:shadow-soft"
            >
              <Github className="h-5 w-5" />
              View on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="mt-4 text-xs text-gray-400">
              MIT Licensed. Contributions welcome.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 border-t border-gray-200 py-6 md:flex-row md:justify-between">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Solarcast. Built with Next.js &
            Open-Meteo.
          </p>
          <p className="text-xs text-gray-400">
            Renewable Energy Potential Dashboard
          </p>
        </div>
      </Container>
    </footer>
  );
}
