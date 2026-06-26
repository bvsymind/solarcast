"use client";

import { useCallback, useRef } from "react";
import { useDashboardStore } from "@/store";
import { captureMapSnapshot } from "@/lib/map-snapshot";

export function usePdfDownload() {
  const solarData = useDashboardStore((s) => s.solarData);
  const pvParams = useDashboardStore((s) => s.pvParams);
  const pvConfig = useDashboardStore((s) => s.pvConfig);
  const pvDerived = useDashboardStore((s) => s.pvDerived);
  const pvEnergy = useDashboardStore((s) => s.pvEnergy);
  const locationName = useDashboardStore((s) => s.locationName);
  const feasibilityInput = useDashboardStore((s) => s.feasibilityInput);
  const feasibilityResult = useDashboardStore((s) => s.feasibilityResult);
  const loadingRef = useRef(false);

  const download = useCallback(async () => {
    if (!solarData || !pvDerived || loadingRef.current) return;
    loadingRef.current = true;
    try {
      // Capture map with grid overlay
      const mapSnapshot = await captureMapSnapshot();

      // Lazy-load @react-pdf/renderer only on first download click
      const { generatePdfBlob } = await import("./generate-pdf");
      const blob = await generatePdfBlob({
        solarData,
        pvParams,
        pvConfig,
        pvDerived,
        pvEnergy,
        locationName,
        feasibilityInput: feasibilityResult ? feasibilityInput : null,
        feasibilityResult,
        mapSnapshot,
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      loadingRef.current = false;
    }
  }, [
    solarData,
    pvParams,
    pvConfig,
    pvDerived,
    pvEnergy,
    locationName,
    feasibilityInput,
    feasibilityResult,
  ]);

  return { download, ready: !!solarData && !!pvDerived };
}
