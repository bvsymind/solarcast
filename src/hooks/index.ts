"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSolarData } from "@/lib/openmeteo";
import { useDashboardStore } from "@/store";
import type { GeoLocation } from "@/types";

export function useSolarDataQuery() {
  const selectedLocation = useDashboardStore((s) => s.selectedLocation);
  const feasibilityInput = useDashboardStore((s) => s.feasibilityInput);
  const hasPolygon = useDashboardStore((s) => s.feasibilityPolygon !== null);
  const setSolarData = useDashboardStore((s) => s.setSolarData);
  const setLocationInfo = useDashboardStore((s) => s.setLocationInfo);
  const setLoading = useDashboardStore((s) => s.setLoading);
  const setError = useDashboardStore((s) => s.setError);

  // Pass tilt/azimuth to Open-Meteo only when feasibility polygon is active
  const tilt = hasPolygon ? feasibilityInput.tiltAngle : undefined;
  const azimuth = hasPolygon ? feasibilityInput.azimuth : undefined;

  const query = useQuery({
    queryKey: [
      "solarData",
      selectedLocation?.lat,
      selectedLocation?.lng,
      tilt,
      azimuth,
    ],
    queryFn: () =>
      fetchSolarData(selectedLocation as GeoLocation, { tilt, azimuth }),
    enabled: selectedLocation !== null,
    staleTime: 1000 * 60 * 30, // 30 min
    retry: 2,
  });

  // Sync query state → store
  useEffect(() => {
    setLoading(query.isLoading || query.isFetching);
  }, [query.isLoading, query.isFetching, setLoading]);

  useEffect(() => {
    if (query.data) {
      setSolarData(query.data);
      setLocationInfo(query.data.location);
    }
  }, [query.data, setSolarData, setLocationInfo]);

  useEffect(() => {
    if (query.error) {
      setError(query.error instanceof Error ? query.error.message : "Failed to fetch data");
    }
  }, [query.error, setError]);

  return query;
}
