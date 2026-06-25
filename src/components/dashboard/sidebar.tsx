"use client";

import { useState, useRef, useCallback } from "react";
import { Search, MapPin, Crosshair, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapLocation } from "./map-container";
import { useDashboardStore } from "@/store";
import { PvParamsForm } from "@/components/pv-simulator";
import { FeasibilityForm } from "@/components/solar-analysis";

interface SidebarProps {
  collapsed: boolean;
  selectedLocation: MapLocation | null;
  onLocationSelect: (loc: MapLocation) => void;
  width: number;
  isMobile?: boolean;
}

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  displayName: string;
  type: string;
}

function SearchBar({
  onSelect,
}: {
  onSelect: (loc: MapLocation) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "5");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("accept-language", "en");

      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "Solarcast/1.0 (solar-energy-dashboard)" },
      });
      if (!res.ok) throw new Error("Geocoding failed");
      const raw: Array<{
        lat: string;
        lon: string;
        display_name: string;
        type: string;
        address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
      }> = await res.json();

      const mapped: GeocodingResult[] = raw.map((r) => ({
        name: r.address?.city || r.address?.town || r.address?.village || r.display_name.split(",")[0],
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        country: r.address?.country ?? "",
        admin1: r.address?.state,
        displayName: r.display_name,
        type: r.type,
      }));
      setResults(mapped);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 500);
  };

  const handleSelect = (r: GeocodingResult) => {
    onSelect({
      lat: r.latitude,
      lng: r.longitude,
      name: `${r.name}, ${[r.admin1, r.country].filter(Boolean).join(", ")}`,
    });
    setQuery(r.name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search location..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
      />
      {loading && (
        <Loader2 className="absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-gray-400" />
      )}

      {/* Dropdown */}
      {open && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {r.name}
                  </p>
                  <p className="truncate text-[10px] text-gray-500">
                    {[r.admin1, r.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CoordinatesCard({
  location,
  onUseCurrent,
}: {
  location: MapLocation | null;
  onUseCurrent: () => void;
}) {
  const hasLocation = location !== null;
  const locationInfo = useDashboardStore((s) => s.locationInfo);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const [gpsLoading, setGpsLoading] = useState(false);

  const elevation = locationInfo?.elevation;
  const timezone = locationInfo?.timezone;

  const handleGps = () => {
    setGpsLoading(true);
    onUseCurrent();
    // Reset after a delay (geolocation is async outside this component)
    setTimeout(() => setGpsLoading(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <MapPin
          className={cn(
            "h-4 w-4 transition-colors",
            hasLocation ? "text-primary-500" : "text-gray-300"
          )}
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Coordinates
        </p>
        {hasLocation && (
          <span className="ml-auto rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600">
            Selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Latitude
          </p>
          <p
            className={cn(
              "text-xl font-semibold tabular-nums transition-colors",
              hasLocation ? "text-gray-900" : "text-gray-300"
            )}
          >
            {hasLocation ? `${location.lat}°` : "— —"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Longitude
          </p>
          <p
            className={cn(
              "text-xl font-semibold tabular-nums transition-colors",
              hasLocation ? "text-gray-900" : "text-gray-300"
            )}
          >
            {hasLocation ? `${location.lng}°` : "— —"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Elevation
          </p>
          <p
            className={cn(
              "text-sm font-medium tabular-nums transition-colors",
              elevation != null ? "text-gray-900" : "text-gray-300",
              isLoading && "animate-pulse"
            )}
          >
            {elevation != null ? `${Math.round(elevation)} m` : "— m"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Timezone
          </p>
          <p
            className={cn(
              "text-sm font-medium transition-colors",
              timezone ? "text-gray-900" : "text-gray-300",
              isLoading && "animate-pulse"
            )}
          >
            {timezone || "—"}
          </p>
        </div>
      </div>

      <button
        onClick={handleGps}
        disabled={gpsLoading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-500 transition-all hover:border-primary-200 hover:text-primary-600 disabled:cursor-wait disabled:opacity-60"
      >
        {gpsLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Crosshair className="h-3.5 w-3.5" />
        )}
        Use Current Location
      </button>
    </div>
  );
}

export function Sidebar({
  collapsed,
  selectedLocation,
  onLocationSelect,
  width,
  isMobile,
}: SidebarProps) {
  const handleGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationSelect({
          lat: Math.round(pos.coords.latitude * 1e5) / 1e5,
          lng: Math.round(pos.coords.longitude * 1e5) / 1e5,
        });
      },
      () => {
        // User denied or error — silently ignore
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-white",
        isMobile
          ? "w-full"
          : cn(
              "relative border-r border-gray-100 transition-[width] duration-300 shrink-0",
              collapsed && "!w-0 overflow-hidden border-r-0"
            )
      )}
      style={isMobile ? undefined : { width: collapsed ? 0 : width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Search or click the map
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
        <SearchBar onSelect={onLocationSelect} />
        <CoordinatesCard
          location={selectedLocation}
          onUseCurrent={handleGps}
        />
        <PvParamsForm />
        <FeasibilityForm />
      </div>
    </aside>
  );
}
