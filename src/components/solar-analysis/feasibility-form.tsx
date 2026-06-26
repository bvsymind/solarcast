"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Ruler, Maximize, SlidersHorizontal, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store";

/* ─── Slider + number input combo ─── */

function SliderInput({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  icon: Icon,
  hint,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-primary-500"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
            }}
            className="w-16 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-right text-sm font-semibold tabular-nums text-gray-900 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <span className="w-6 text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      {hint && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
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

/* ─── Main component ─── */

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
            {drawMode
              ? "Click map to draw polygon…"
              : hasPolygon
                ? "Redraw Area"
                : "Draw Area on Map"}
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

          {/* Tilt angle — slider + input */}
          <SliderInput
            label="Tilt Angle"
            unit="°"
            value={input.tiltAngle}
            min={0}
            max={60}
            step={1}
            onChange={(v) => setInput({ tiltAngle: v })}
            icon={SlidersHorizontal}
            hint={
              lat != null
                ? `Optimal for ${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"}: ~${autoTilt}°`
                : undefined
            }
          />

          {/* Azimuth — slider + input */}
          <SliderInput
            label="Azimuth"
            unit="°"
            value={input.azimuth}
            min={0}
            max={359}
            step={1}
            onChange={(v) => setInput({ azimuth: v })}
            icon={Compass}
            hint="0°=N, 90°=E, 180°=S, 270°=W"
          />

          {/* Ground Coverage Ratio — slider + input */}
          <SliderInput
            label="Ground Coverage Ratio"
            unit="%"
            value={Math.round(input.groundCoverageRatio * 100)}
            min={10}
            max={90}
            step={5}
            onChange={(v) =>
              setInput({ groundCoverageRatio: v / 100 })
            }
            icon={Maximize}
            hint="Fraction of land covered by panels"
          />
        </div>
      )}
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
