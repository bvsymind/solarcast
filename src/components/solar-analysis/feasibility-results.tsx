"use client";

import { Sun, Zap, Layers, Calendar, Maximize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatArea(m2: number): string {
  if (m2 >= 10_000) return `${(m2 / 10_000).toFixed(2)} ha`;
  return `${m2.toLocaleString()} m²`;
}

export function FeasibilityResults() {
  const result = useDashboardStore((s) => s.feasibilityResult);
  const hasPolygon = useDashboardStore((s) => s.feasibilityPolygon !== null);
  const solarData = useDashboardStore((s) => s.solarData);
  const isLoading = useDashboardStore((s) => s.isLoading);

  // Only show if polygon exists (even if result still computing)
  if (!hasPolygon && !result) return null;

  // Computing state
  if (hasPolygon && !result && (isLoading || !solarData)) {
    return (
      <div>
        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Feasibility
        </p>
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 py-8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-500" />
          <span className="text-xs text-gray-400">Computing layout…</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div>
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Feasibility
      </p>

      <div className="space-y-2">
        {/* Polygon Area */}
        <FeasibilityRow
          label="Polygon Area"
          value={formatArea(result.polygonAreaM2)}
          icon={Maximize}
        />

        {/* Effective Area */}
        <FeasibilityRow
          label="Effective Area"
          value={formatArea(result.effectiveAreaM2)}
          icon={Layers}
          sub={`GCR ${Math.round(
            (useDashboardStore.getState().feasibilityInput.groundCoverageRatio) * 100
          )}%`}
        />

        {/* Panel Count */}
        <FeasibilityRow
          label="Panels"
          value={formatNumber(result.panelCount)}
          icon={Sun}
          accent="orange"
        />

        {/* Installed Capacity */}
        <FeasibilityRow
          label="Capacity"
          value={`${result.installedCapacityKw.toFixed(1)} kWp`}
          icon={Zap}
          accent="orange"
        />

        {/* Annual Energy */}
        <FeasibilityRow
          label="Annual Energy"
          value={`${(result.annualEnergyKwh / 1000).toFixed(1)} MWh`}
          icon={Calendar}
          accent="orange"
        />
      </div>

      {/* Monthly energy mini table */}
      {result.monthlyEnergy.length > 0 && (
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
          <p className="mb-2 text-[10px] font-medium text-gray-400">
            Monthly Energy (kWh)
          </p>
          <div className="grid grid-cols-6 gap-1">
            {result.monthlyEnergy.map((m) => (
              <div key={m.month} className="text-center">
                <span className="block text-[9px] text-gray-400">
                  {m.month.slice(0, 3)}
                </span>
                <span className="block text-[10px] font-semibold tabular-nums text-gray-700">
                  {m.energy > 1000
                    ? `${(m.energy / 1000).toFixed(1)}k`
                    : m.energy}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Metric Row ─── */

interface FeasibilityRowProps {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: "orange" | "sky";
  sub?: string;
}

function FeasibilityRow({
  label,
  value,
  icon: Icon,
  accent = "sky",
  sub,
}: FeasibilityRowProps) {
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
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
      <span className="text-sm font-semibold tabular-nums text-gray-900">
        {value}
      </span>
    </div>
  );
}
