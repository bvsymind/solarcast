import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Solarcast — Renewable Energy Potential Dashboard",
  description:
    "Analyze solar energy potential at any location using real weather data. Interactive maps, PV simulation, and PDF export for engineers and researchers.",
  keywords: [
    "solar energy",
    "renewable energy",
    "PV simulation",
    "solar potential",
    "GHI",
    "DNI",
    "Open-Meteo",
    "solar dashboard",
  ],
  openGraph: {
    title: "Solarcast — Renewable Energy Potential Dashboard",
    description:
      "Analyze solar energy potential at any location using real weather data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("scroll-smooth", "font-sans", geist.variable)}
    >
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
