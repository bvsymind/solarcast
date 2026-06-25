"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Ruler, Maximize, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store";

export function FeasibilityForm() {
  const [open, setOpen] = useState(false);
  const input = useDashboardStore((s) => s.feasibilityInput);
  const setInput = useDashboardStore((s) => s.setFeasibilityInput);
  const hasPolygon = useDashboardStore((s) => s.feasibilityPolygon !== null);
  const solarData = useDashboardStore((s) => s.solarData);
  const drawMode = useDashboardStore((s) => s.drawMode);
  const setDrawMode = useDashboardStore((s) => s.setDrawMode);

  // Auto-compute tilt from latitude
  const lat = solarData?.location?.lat ?? null;
  const autoTilt = lat != null ? Math.round(Math.abs(lat) * 0.76 + 3.1) : 20;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Maximize
            className={cn(
              "h-4 w-4 transition-colors",
              hasPolygon ? "text-primary-500" : "text-gray-300"
            )}
          />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Solar Feasibility
            </p>
            <p className="text-[10px] text-gray-400">
              {hasPolygon ? "Area selected" : "Draw polygon to begin"}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        )}
      </button>

      {/* Body */}
      {open && (
        <div className="space-y-4 border-t border-gray-50 px-5 pb-5 pt-4">
          {/* Draw polygon CTA */}
          <button
            onClick={() => setDrawMode(!drawMode)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-all",
              drawMode
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-dashed border-primary-200 bg-primary-50/50 text-primary-600 hover:bg-primary-50"
            )}
          >
            <PencilIcon className="h-3.5 w-3.5" />
            {drawMode ? "Click map to draw polygon…" : hasPolygon ? "Redraw Area" : "Draw Area on Map"}
          </button>

          {/* Panel dimensions */}
          <PanelDimsInput
            label="Panel Length"
            unit="mm"
            value={input.panelLengthMm}
            onChange={(v) => setInput({ panelLengthMm: v })}
            icon={Ruler}
          />

          <PanelDimsInput
            label="Panel Width"
            unit="mm"
            value={input.panelWidthMm}
            onChange={(v) => setInput({ panelWidthMm: v })}
            icon={Ruler}
          />

          {/* Tilt angle */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Tilt Angle
            </label>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <input
                type="range"
                min={0}
                max={60}
                step={1}
                value={input.tiltAngle}
                onChange={(e) => setInput({ tiltAngle: Number(e.target.value) })}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-primary-500"
              />
              <span className="w-10 text-right text-sm font-semibold tabular-nums text-gray-700">
                {input.tiltAngle}°
              </span>
            </div>
            {lat != null && (
              <p className="mt-1 text-[10px] text-gray-400">
                Optimal for {Math.abs(lat).toFixed(1)}°{lat >= 0 ? "N" : "S"}: ~{autoTilt}°
              </p>
            )}
          </div>

          {/* Ground Coverage Ratio */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Ground Coverage Ratio
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={input.groundCoverageRatio}
                onChange={(e) =>
                  setInput({ groundCoverageRatio: Number(e.target.value) })
                }
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-primary-500"
              />
              <span className="w-10 text-right text-sm font-semibold tabular-nums text-gray-700">
                {Math.round(input.groundCoverageRatio * 100)}%
              </span>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Fraction of land covered by panels
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Number input for panel dimensions ─── */

function PanelDimsInput({
  label,
  unit,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ElementType;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label} ({unit})
      </label>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <input
          type="number"
          min={500}
          max={3000}
          step={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 500)}
          className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
    </div>
  );
}

/* ─── Pencil icon (inline) ─── */

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}
