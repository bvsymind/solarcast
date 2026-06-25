"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "maplibre-gl-draw/dist/mapbox-gl-draw.css";
import { usePolygonDraw, DrawToolbar, useArrayOverlay } from "@/components/map";
import type { ArrayRow } from "@/types";

export interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface MapContainerProps {
  onLocationSelect: (loc: MapLocation) => void;
  selectedLocation: MapLocation | null;
  isMobile?: boolean;
  /* ─── Feasibility polygon props ─── */
  drawMode?: boolean;
  hasPolygon?: boolean;
  onDrawPolygon?: (polygon: GeoJSON.Polygon) => void;
  onClearPolygon?: () => void;
  onToggleDraw?: () => void;
  feasibilityRows?: ArrayRow[] | null;
}

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm-raster": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm-raster",
    },
  ],
};

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 1.8;

export function MapContainer({
  onLocationSelect,
  selectedLocation,
  isMobile,
  drawMode = false,
  hasPolygon = false,
  onDrawPolygon,
  onClearPolygon,
  onToggleDraw,
  feasibilityRows,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Keep callback in a ref so map handlers always use latest
  const onSelectRef = useRef(onLocationSelect);
  onSelectRef.current = onLocationSelect;

  // Keep drawMode in a ref so the click handler can check it
  const drawModeRef = useRef(drawMode);
  drawModeRef.current = drawMode;

  // Flag to skip the sync flyTo when the user clicked the map
  const internalUpdateRef = useRef(false);

  // ── Init map ONCE ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    // Delay init by one frame so the flex layout has settled
    const raf = requestAnimationFrame(() => {
      if (!container || mapRef.current) return;

      const map = new maplibregl.Map({
        container,
        style: OSM_STYLE,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: true, showZoom: true }),
        "top-right"
      );

      // Push nav control below the desktop collapse toggle buttons
      const navEl = map.getContainer().querySelector(".maplibregl-ctrl-top-right") as HTMLElement;
      if (navEl) navEl.style.marginTop = "44px";
      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      // Click → place marker + report coords (skip when drawing polygon)
      map.on("click", (e) => {
        // Don't interfere with polygon draw mode
        if (drawModeRef.current) return;

        const { lng, lat } = e.lngLat;

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          markerRef.current = new maplibregl.Marker({
            color: "#FF5A00",
            anchor: "bottom",
          })
            .setLngLat([lng, lat])
            .addTo(map);
        }

        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 8),
          duration: 800,
        });

        internalUpdateRef.current = true;
        onSelectRef.current({ lat: roundCoord(lat), lng: roundCoord(lng) });
      });

      map.getCanvas().style.cursor = "crosshair";

      // Resize after tiles load
      map.once("idle", () => {
        map.resize();
      });

      mapRef.current = map;
    });

    return () => {
      cancelAnimationFrame(raf);
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Polygon draw control ──
  const { clearPolygon } = usePolygonDraw({
    map: mapRef.current,
    active: drawMode,
    onPolygon: (polygon) => {
      onDrawPolygon?.(polygon);
    },
    onClear: () => {
      onClearPolygon?.();
    },
  });

  // ── Solar array overlay ──
  useArrayOverlay({
    map: mapRef.current,
    rows: feasibilityRows ?? null,
    visible: hasPolygon && !drawMode,
  });

  // ── Sync external location changes (search / GPS) to map ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    // Skip flyTo if user just clicked the map (already handled in click handler)
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }

    const { lng, lat } = selectedLocation;

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new maplibregl.Marker({
        color: "#FF5A00",
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(map);
    }

    // Fly to location
    map.flyTo({
      center: [lng, lat],
      zoom: 10,
      duration: 1000,
    });
  }, [selectedLocation]);

  // ── Handle sidebar collapse / expand ──
  useEffect(() => {
    // Trigger map resize whenever the component re-renders (layout changes)
    const timer = setTimeout(() => {
      mapRef.current?.resize();
    }, 350); // match the sidebar transition duration
    return () => clearTimeout(timer);
  });

  return (
    <section className={`overflow-hidden bg-gray-100 ${isMobile ? "absolute inset-0" : "relative flex-1"}`}>
      <div ref={containerRef} className="h-full w-full absolute inset-0" />

      {/* Hint overlay */}
      {!selectedLocation && !drawMode && (
        <div className={`pointer-events-none absolute inset-0 z-10 flex items-end justify-center ${isMobile ? "pb-24" : "pb-8"}`}>
          <div className="animate-slide-up rounded-2xl border border-gray-200 bg-white/90 px-6 py-3 text-sm font-medium text-gray-600 shadow-glass backdrop-blur-sm">
            Click anywhere on the map to select a location
          </div>
        </div>
      )}

      {/* Draw mode hint */}
      {drawMode && (
        <div className={`pointer-events-none absolute inset-0 z-10 flex items-end justify-center ${isMobile ? "pb-24" : "pb-8"}`}>
          <div className="rounded-2xl border border-primary-200 bg-primary-50/95 px-6 py-3 text-sm font-medium text-primary-700 shadow-glass backdrop-blur-sm">
            Click to place vertices · Double-click to close polygon
          </div>
        </div>
      )}

      {/* Draw toolbar */}
      <DrawToolbar
        active={drawMode}
        hasPolygon={hasPolygon}
        onToggle={() => onToggleDraw?.()}
        onClear={() => {
          clearPolygon();
          onClearPolygon?.();
        }}
      />
    </section>
  );
}

function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

