"use client";

import { useCallback, useRef } from "react";
import { useDashboardStore } from "@/store";

export function usePdfDownload() {
  const solarData = useDashboardStore((s) => s.solarData);
  const pvParams = useDashboardStore((s) => s.pvParams);
  const pvConfig = useDashboardStore((s) => s.pvConfig);
  const pvDerived = useDashboardStore((s) => s.pvDerived);
  const pvEnergy = useDashboardStore((s) => s.pvEnergy);
  const locationName = useDashboardStore((s) => s.locationName);
  const loadingRef = useRef(false);

  const download = useCallback(async () => {
    if (!solarData || !pvDerived || loadingRef.current) return;
    loadingRef.current = true;
    try {
      // Lazy-load @react-pdf/renderer only on first download click
      const { generatePdfBlob } = await import("./generate-pdf");
      const blob = await generatePdfBlob({
        solarData, pvParams, pvConfig, pvDerived, pvEnergy, locationName,
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      loadingRef.current = false;
    }
  }, [solarData, pvParams, pvConfig, pvDerived, pvEnergy, locationName]);

  return { download, ready: !!solarData && !!pvDerived };
}
