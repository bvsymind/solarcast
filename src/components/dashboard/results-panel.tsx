"use client";

import { useState } from "react";
import {
  Sun,
  Thermometer,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store";
import { IrradianceChart, TemperatureChart } from "@/components/charts";
import { PvResultsSummary } from "@/components/pv-simulator";
import { FeasibilityResults } from "@/components/solar-analysis";
import { usePdfDownload } from "@/components/pdf";

interface ResultsPanelProps {
  collapsed: boolean;
  width: number;
  isMobile?: boolean;
}

function formatValue(val: number): string {
  return val > 0 ? val.toFixed(2) : "—";
}

/* ─── Metric Row ─── */

interface MetricRowProps {
  label: string;
  unit: string;
  value: string;
  icon: React.ElementType;
  accent?: "orange" | "sky";
}

function MetricRow({
  label,
  unit,
  value,
  icon: Icon,
  accent = "sky",
}: MetricRowProps) {
  const hasValue = value !== "—";
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            accent === "orange"
              ? "bg-primary-50 text-primary-500"
              : "bg-sky-50 text-sky-500"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-[10px] text-gray-400">{unit}</p>
        </div>
      </div>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          hasValue ? "text-gray-900" : "text-gray-300"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ResultsPanel({ collapsed, width, isMobile }: ResultsPanelProps) {
  const [chartsOpen, setChartsOpen] = useState(true);

  const solarData = useDashboardStore((s) => s.solarData);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const error = useDashboardStore((s) => s.error);
  const hasLocation = useDashboardStore((s) => s.selectedLocation !== null);

  const { download, ready: pdfReady } = usePdfDownload();

  const annual = solarData?.annual;
  const monthly = solarData?.monthly ?? [];

  const metrics: MetricRowProps[] = [
    {
      label: "GHI",
      unit: "kWh/m²/day",
      value: annual ? formatValue(annual.ghi) : "—",
      icon: Sun,
      accent: "orange",
    },
    {
      label: "DNI",
      unit: "kWh/m²/day",
      value: annual ? formatValue(annual.dni) : "—",
      icon: Zap,
      accent: "orange",
    },
    {
      label: "DHI",
      unit: "kWh/m²/day",
      value: annual ? formatValue(annual.dhi) : "—",
      icon: Sun,
      accent: "sky",
    },
    {
      label: "Temperature",
      unit: "°C",
      value: annual ? formatValue(annual.temperature) : "—",
      icon: Thermometer,
    },
    {
      label: "Peak Sun Hours",
      unit: "hours/day",
      value: annual ? formatValue(annual.psh) : "—",
      icon: Clock,
      accent: "orange",
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-white",
        isMobile
          ? "w-full"
          : cn(
              "relative border-l border-gray-100 transition-[width] duration-300 shrink-0",
              collapsed && "!w-0 overflow-hidden border-l-0"
            )
      )}
      style={isMobile ? undefined : { width: collapsed ? 0 : width }}
    >
      {/* Header — hidden on mobile (MobileSheet provides title) */}
      {!isMobile && (<div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Analysis Results
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {!hasLocation
              ? "Select a location to begin"
              : isLoading
              ? "Fetching data…"
              : error
              ? "Error loading data"
              : "Annual averages"}
          </p>
        </div>
        {pdfReady && (
          <button
            onClick={download}
            className="shrink-0 rounded-xl border border-gray-200 bg-white p-2 text-gray-400 shadow-card transition-all hover:border-primary-200 hover:text-primary-500"
            aria-label="Download PDF report"
            title="Download PDF Report"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>)}

      {/* PDF download button — always visible on mobile */}
      {isMobile && pdfReady && (
        <div className="px-4 pt-4 flex justify-end">
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-card transition-all hover:border-primary-200 hover:text-primary-500"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-500" />
            <p className="text-xs">Fetching solar data from Open-Meteo…</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Data */}
        {!isLoading && !error && solarData && (
          <>
            <div>
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Solar Resource
              </p>
              <div className="space-y-2">
                {metrics.map((m) => (
                  <MetricRow key={m.label} {...m} />
                ))}
              </div>
            </div>

            {/* Charts */}
            <div>
              <button
                onClick={() => setChartsOpen(!chartsOpen)}
                className="mb-3 flex w-full items-center justify-between px-1"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Charts
                </p>
                {chartsOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>

              {chartsOpen && (
                <div className="space-y-3">
                  <IrradianceChart data={monthly} />
                  <TemperatureChart data={monthly} />
                </div>
              )}
            </div>

            {/* PV System Results */}
            <PvResultsSummary />

            {/* Feasibility Results */}
            <FeasibilityResults />
          </>
        )}

        {/* Empty state */}
        {!isLoading && !error && !solarData && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <Sun className="mb-3 h-8 w-8 opacity-30" />
            <p className="text-xs">Click the map to see solar data</p>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-center text-[10px] text-gray-400">
          Data: Open-Meteo API · Updated hourly
        </p>
      </div>
    </aside>
  );
}
