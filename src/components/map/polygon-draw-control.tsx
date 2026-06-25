"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "maplibre-gl-draw";
import { Pencil, Trash2, X } from "lucide-react";

/**
 * PolygonDrawControl — adds MapLibre GL Draw to the map for polygon drawing.
 *
 * Event flow:
 * - draw.create → emits GeoJSON polygon → store.setFeasibilityPolygon()
 * - draw.update → emits updated polygon → store.setFeasibilityPolygon()
 * - draw.delete → clears → store.setFeasibilityPolygon(null)
 */

interface PolygonDrawControlProps {
  map: maplibregl.Map | null;
  /** Whether draw mode is active */
  active: boolean;
  /** Called when user finishes drawing (create/update) */
  onPolygon: (polygon: GeoJSON.Polygon) => void;
  /** Called when polygon is deleted */
  onClear: () => void;
}

export function usePolygonDraw({
  map,
  active,
  onPolygon,
  onClear,
}: PolygonDrawControlProps) {
  const drawRef = useRef<MapboxDraw | null>(null);

  const handleCreate = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      const feature = e.features[0];
      if (feature && feature.geometry.type === "Polygon") {
        onPolygon(feature.geometry as GeoJSON.Polygon);
      }
    },
    [onPolygon]
  );

  const handleUpdate = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      const feature = e.features[0];
      if (feature && feature.geometry.type === "Polygon") {
        onPolygon(feature.geometry as GeoJSON.Polygon);
      }
    },
    [onPolygon]
  );

  const handleDelete = useCallback(() => {
    onClear();
  }, [onClear]);

  // Init / destroy draw control
  useEffect(() => {
    if (!map) return;

    // Create draw instance
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "simple_select",
    });

    map.addControl(draw as unknown as maplibregl.IControl);
    drawRef.current = draw;

    // Event listeners
    map.on("draw.create", handleCreate);
    map.on("draw.update", handleUpdate);
    map.on("draw.delete", handleDelete);

    return () => {
      map.off("draw.create", handleCreate);
      map.off("draw.update", handleUpdate);
      map.off("draw.delete", handleDelete);
      try {
        map.removeControl(draw as unknown as maplibregl.IControl);
      } catch {
        // ignore
      }
      drawRef.current = null;
    };
  }, [map, handleCreate, handleUpdate, handleDelete]);

  // Toggle draw mode
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw || !map) return;

    if (active) {
      draw.changeMode("draw_polygon");
      map.getCanvas().style.cursor = "crosshair";
      // Disable map click-to-place during draw
      map.dragPan.disable();
    } else {
      draw.changeMode("simple_select");
      map.getCanvas().style.cursor = "";
      map.dragPan.enable();
    }
  }, [active, map]);

  // Clear polygon
  const clearPolygon = useCallback(() => {
    const draw = drawRef.current;
    if (draw) {
      draw.deleteAll();
      onClear();
    }
  }, [onClear]);

  return { clearPolygon, draw: drawRef };
}

/* ─── Toolbar button component ─── */

interface DrawToolbarProps {
  active: boolean;
  hasPolygon: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export function DrawToolbar({
  active,
  hasPolygon,
  onToggle,
  onClear,
}: DrawToolbarProps) {
  return (
    <div className="absolute top-16 right-3 z-20 flex flex-col gap-1">
      {/* Toggle draw mode */}
      <button
        onClick={onToggle}
        className={`rounded-xl border p-2 shadow-card transition-all ${
          active
            ? "border-primary-300 bg-primary-50 text-primary-600"
            : "border-gray-200 bg-white text-gray-500 hover:text-primary-500"
        }`}
        aria-label={active ? "Cancel drawing" : "Draw polygon area"}
        title={active ? "Cancel drawing" : "Draw feasibility area"}
      >
        {active ? (
          <X className="h-4 w-4" />
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </button>

      {/* Clear polygon */}
      {hasPolygon && !active && (
        <button
          onClick={onClear}
          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-400 shadow-card transition-all hover:border-red-200 hover:text-red-500"
          aria-label="Clear polygon"
          title="Clear feasibility area"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
