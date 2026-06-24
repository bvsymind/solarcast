# ☀️ Solarcast

**Renewable Energy Potential Dashboard** — analyze solar energy potential at any location on Earth using real weather data.

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4)

---

## 🔍 Overview

Solarcast is a modern web application inspired by the [Global Solar Atlas](https://globalsolaratlas.info). It allows engineers, researchers, and students to:

- Select any location via interactive map, search, or GPS
- View real solar resource data (GHI, DNI, DHI, temperature, peak sun hours)
- Simulate PV system performance using ETAP-based models
- Visualize monthly irradiance, temperature, and energy production
- Export professional PDF reports

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Map** | Click anywhere on the MapLibre GL map or search by location name |
| ☀️ **Solar Analysis** | Real GHI, DNI, DHI, temperature, and PSH data from Open-Meteo |
| ⚡ **PV Simulation** | ETAP-based PV array modeling with configurable panel parameters |
| 📊 **Live Charts** | Monthly irradiance (grouped bars) and temperature (gradient area) via Recharts |
| 📄 **PDF Export** | Professional A4 report with location, solar resource, PV config, and energy estimates |
| 📱 **Responsive** | Desktop 3-column layout + mobile bottom-sheet panels |
| 🔍 **Geocoding** | Nominatim (OpenStreetMap) search with city/state/country results |
| 📍 **GPS Locate** | Browser geolocation for instant local analysis |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Map | [MapLibre GL](https://maplibre.org) |
| Charts | [Recharts](https://recharts.org) |
| State | [Zustand](https://zustand.docs.pmnd.rs) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| PDF | [@react-pdf/renderer](https://react-pdf.org) |
| Weather API | [Open-Meteo](https://open-meteo.com) (Free, no API key) |
| Geocoding | [Nominatim](https://nominatim.org) (Free, no API key) |
| Deployment | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/bvsymind/solarcast.git
cd solarcast
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # TanStack Query provider
│   └── dashboard/
│       └── page.tsx              # Dashboard page
├── components/
│   ├── layout/                   # Navbar, Footer, Container, Section
│   ├── dashboard/                # DashboardShell, Sidebar, MapContainer, ResultsPanel
│   ├── charts/                   # IrradianceChart, TemperatureChart (Recharts)
│   ├── pv-simulator/             # PV parameter form, results summary
│   └── pdf/                      # PDF report document, download hook (lazy-loaded)
├── lib/
│   ├── openmeteo.ts              # Open-Meteo API client (SDK)
│   ├── pv-calculator.ts          # ETAP PV simulation engine
│   └── utils.ts                  # cn() helper
├── hooks/
│   ├── index.ts                  # useSolarDataQuery
│   └── use-resizable.ts          # Drag-resize hook + useMediaQuery
├── store/
│   └── index.ts                  # Zustand store
├── types/
│   └── index.ts                  # Shared TypeScript types
└── styles/
    └── design-tokens.ts          # Color palette, typography, shadows
```

---

## 🔬 ETAP PV Model

The simulation engine implements ETAP-based photovoltaic array modeling:

- **Derived values**: Varray = Vmp × Nseries, Iarray = Imp × Nparallel, Parray = Power × Nseries × Nparallel
- **Temperature correction**: Voc(T) = Voc × (1 + βVoc × ΔT), Isc(T) = Isc × (1 + αIsc × ΔT)
- **Irradiance correction**: P(G) ≈ Prated × (G / 1000)
- **Energy estimation**: E = Capacity × PSH × days × PR (PR = 0.80 default)

---

## 📊 Data Sources

All data comes from free, open APIs — no API keys required:

- **Solar radiation & temperature**: Open-Meteo Historical Forecast API (hourly, last 12 months)
- **Elevation**: From Open-Meteo response
- **Geocoding**: Nominatim (OpenStreetMap)
- **Map tiles**: OpenStreetMap raster tiles

---

## 📄 License

MIT © Solarcast

---

Built with ☀️ for renewable energy education and research.
