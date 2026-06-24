import Link from "next/link";
import {
  ArrowRight,
  Sun,
  MapPin,
  Zap,
  FileText,
  Globe,
  Database,
  Cpu,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/layout/container";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Sun,
    title: "Solar Potential Analysis",
    description:
      "Get accurate GHI, DNI, and DHI data for any location using real Open-Meteo weather data.",
  },
  {
    icon: MapPin,
    title: "Interactive Map",
    description:
      "Click anywhere on the map or search by address to analyze solar resources instantly.",
  },
  {
    icon: Zap,
    title: "PV Simulation",
    description:
      "ETAP-based photovoltaic simulation engine to estimate energy production and system sizing.",
  },
  {
    icon: FileText,
    title: "PDF Export",
    description:
      "Generate professional reports with charts, maps, and complete analysis results.",
  },
];

const techStack: {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
}[] = [
  {
    icon: Globe,
    title: "Open-Meteo",
    description:
      "Free, open-source weather API providing high-resolution solar radiation data worldwide.",
    tags: ["Solar Radiation", "Temperature", "Elevation"],
  },
  {
    icon: Database,
    title: "GIS Mapping",
    description:
      "Open-source MapLibre GL for interactive, high-performance map rendering with vector tiles.",
    tags: ["MapLibre GL", "OpenStreetMap", "Vector Tiles"],
  },
  {
    icon: Cpu,
    title: "Solar Modeling",
    description:
      "ETAP-based PV array simulation with temperature and irradiance correction for accurate results.",
    tags: ["ETAP Model", "PVwatts", "GHI / DNI / DHI"],
  },
];

const stats = [
  { value: "100%", label: "Global Coverage" },
  { value: "Hourly", label: "Data Refresh" },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-white via-primary-50/20 to-sky-50/30">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-[10%] -top-[10%] aspect-square w-[60%] rounded-full bg-primary-500/[0.04] blur-[120px]" />
          <div className="absolute -bottom-[10%] -left-[10%] aspect-square w-[60%] rounded-full bg-sky-400/[0.04] blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary-400/[0.06] to-sky-400/[0.06] blur-[100px]" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <Container className="relative z-10 w-full py-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Tagline pill */}
            <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-4 py-2 text-sm font-medium text-primary-700 backdrop-blur-sm">
              <Sun className="h-4 w-4" />
              Powered by Open-Meteo
            </div>

            {/* Headline */}
            <h1 className="animate-slide-up mb-6 text-hero">
              SOLAR<span className="gradient-text">CAST</span>
            </h1>

            <p className="animate-slide-up mx-auto mb-10 max-w-xl text-pretty text-base leading-relaxed text-gray-600 sm:text-lg [animation-delay:150ms]">
              Analyze solar energy potential at any location on Earth.
              Interactive maps, real weather data, and professional PV
              simulation for engineers and researchers.
            </p>

            {/* CTAs */}
            <div className="animate-slide-up mb-16 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4 [animation-delay:300ms]">
              <Link href="/dashboard" className="btn-primary w-full text-base sm:w-auto">
                Explore Solar Potential
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="btn-glass w-full text-base sm:w-auto"
              >
                Learn More
                <ChevronDown className="ml-2 h-4 w-4" />
              </a>
            </div>

            {/* Stats */}
            <div className="animate-fade-in mx-auto flex max-w-sm flex-col gap-6 sm:flex-row sm:justify-center sm:gap-16 [animation-delay:500ms]">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-display gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce md:block">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-gray-300 p-1.5">
            <div className="h-2 w-2 rounded-full bg-primary-500" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-padding bg-surface-secondary">
        <Container>
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
              Capabilities
            </p>
            <h2 className="text-display mb-4">Everything you need</h2>
            <p className="mx-auto max-w-xl text-pretty text-base text-gray-500 sm:text-lg">
              Professional-grade solar analysis tools in a modern, intuitive
              interface.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="glass-card group relative overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-soft"
              >
                {/* Card glow on hover */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-500/[0.06] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Technology */}
      <section id="technology" className="section-padding">
        <Container>
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
              Stack
            </p>
            <h2 className="text-display mb-4">
              Powered by
              <span className="gradient-text"> Open Data</span>
            </h2>
            <p className="mx-auto max-w-xl text-pretty text-base text-gray-500 sm:text-lg">
              Built on reliable, open-source technologies and free weather APIs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {techStack.map(({ icon: Icon, title, description, tags }) => (
              <div
                key={title}
                className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-soft"
              >
                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 transition-colors duration-300 group-hover:bg-sky-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-gray-500">
                  {description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="section-padding bg-surface-secondary">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 p-px shadow-soft sm:rounded-[2.5rem]">
            <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-6 py-16 text-center sm:rounded-[2.45rem] sm:px-8 sm:py-20">
              {/* Decorative */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.07] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/[0.05] blur-3xl" />

              <div className="relative z-10 mx-auto max-w-2xl">
                <h2 className="text-display mb-4 text-white">
                  Ready to explore solar potential?
                </h2>
                <p className="mb-8 text-base leading-relaxed text-primary-100 sm:mb-10 sm:text-lg">
                  Start analyzing solar resources at any location. Free,
                  unlimited, and powered by real weather data.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-lg transition-all duration-300 hover:bg-white/95 hover:shadow-xl hover:shadow-white/20 active:scale-[0.98]"
                >
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
