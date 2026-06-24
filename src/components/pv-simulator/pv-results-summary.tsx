"use client";

import { Zap, Battery, Gauge } from "lucide-react";
import { useDashboardStore } from "@/store";

export function PvResultsSummary() {
  const pvDerived = useDashboardStore((s) => s.pvDerived);
  const pvEnergy = useDashboardStore((s) => s.pvEnergy);

  if (!pvDerived) return null;

  return (
    <div className="space-y-3">
      <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        PV System
      </p>

      {/* Array specs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-gray-100 bg-white p-3">
          <p className="mb-1 text-[10px] text-gray-400">Array Voltage</p>
          <p className="text-sm font-semibold tabular-nums text-gray-900">
            {pvDerived.vArray.toFixed(1)} <span className="text-xs font-normal text-gray-400">V</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3">
          <p className="mb-1 text-[10px] text-gray-400">Array Current</p>
          <p className="text-sm font-semibold tabular-nums text-gray-900">
            {pvDerived.iArray.toFixed(1)} <span className="text-xs font-normal text-gray-400">A</span>
          </p>
        </div>
      </div>

      {/* Installed capacity */}
      <div className="rounded-xl border border-gray-100 bg-primary-50/50 p-3">
        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4 text-primary-500" />
          <p className="text-[10px] text-gray-500">Installed Capacity</p>
        </div>
        <p className="mt-1 text-lg font-bold tabular-nums text-primary-600">
          {(pvDerived.pArray / 1000).toFixed(2)}
          <span className="ml-1 text-xs font-normal text-primary-400">kWp</span>
        </p>
      </div>

      {/* Energy estimation */}
      {pvEnergy && (
        <div className="space-y-2">
          <div className="rounded-xl border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary-500" />
              <p className="text-[10px] text-gray-500">Annual Energy</p>
            </div>
            <p className="mt-1 text-lg font-bold tabular-nums text-gray-900">
              {(pvEnergy.annual / 1000).toFixed(2)}
              <span className="ml-1 text-xs font-normal text-gray-400">MWh</span>
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-sky-500" />
              <p className="text-xs text-gray-600">Capacity Factor</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-sky-600">
              {pvEnergy.capacityFactor}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
