"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSolarData } from "@/lib/openmeteo";
import { useDashboardStore } from "@/store";
import type { GeoLocation } from "@/types";

export function useSolarDataQuery() {
  const selectedLocation = useDashboardStore((s) => s.selectedLocation);
  const setSolarData = useDashboardStore((s) => s.setSolarData);
  const setLocationInfo = useDashboardStore((s) => s.setLocationInfo);
  const setLoading = useDashboardStore((s) => s.setLoading);
  const setError = useDashboardStore((s) => s.setError);

  const query = useQuery({
    queryKey: ["solarData", selectedLocation?.lat, selectedLocation?.lng],
    queryFn: () => fetchSolarData(selectedLocation as GeoLocation),
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
