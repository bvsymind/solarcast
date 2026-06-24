"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { useDashboardStore } from "@/store";

function NumInput({
  label,
  value,
  unit,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-gray-50">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          step={step ?? 0.01}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-xs font-medium tabular-nums text-gray-900 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-100"
        />
        {unit && (
          <span className="w-6 text-[10px] text-gray-400">{unit}</span>
        )}
      </div>
    </div>
  );
}

export function PvParamsForm() {
  const [open, setOpen] = useState(true);

  const pvParams = useDashboardStore((s) => s.pvParams);
  const pvConfig = useDashboardStore((s) => s.pvConfig);
  const setPvParams = useDashboardStore((s) => s.setPvParams);
  const setPvConfig = useDashboardStore((s) => s.setPvConfig);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            PV Parameters
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-2">
          {/* Panel specs */}
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Panel
          </p>
          <div className="space-y-1">
            <NumInput label="Power" value={pvParams.power} unit="W" step={10} onChange={(v) => setPvParams({ power: v })} />
            <NumInput label="Vmp" value={pvParams.vmp} unit="V" onChange={(v) => setPvParams({ vmp: v })} />
            <NumInput label="Voc" value={pvParams.voc} unit="V" onChange={(v) => setPvParams({ voc: v })} />
            <NumInput label="Imp" value={pvParams.imp} unit="A" onChange={(v) => setPvParams({ imp: v })} />
            <NumInput label="Isc" value={pvParams.isc} unit="A" onChange={(v) => setPvParams({ isc: v })} />
          </div>

          {/* Temperature coefficients */}
          <p className="mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Temp Coeff
          </p>
          <div className="space-y-1">
            <NumInput label="α Isc" value={pvParams.alphaIsc} unit="%/°C" step={0.01} onChange={(v) => setPvParams({ alphaIsc: v })} />
            <NumInput label="β Voc" value={pvParams.betaVoc} unit="%/°C" step={0.01} onChange={(v) => setPvParams({ betaVoc: v })} />
          </div>

          {/* Array config */}
          <p className="mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Array
          </p>
          <div className="space-y-1">
            <NumInput label="Series (Nₛ)" value={pvConfig.nSeries} step={1} onChange={(v) => setPvConfig({ nSeries: v })} />
            <NumInput label="Parallel (Nₚ)" value={pvConfig.nParallel} step={1} onChange={(v) => setPvConfig({ nParallel: v })} />
          </div>
        </div>
      )}
    </div>
  );
}
