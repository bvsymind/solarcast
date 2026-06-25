"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { ArrayRow } from "@/types";

/**
 * ArrayOverlay — renders solar panel rows as a GeoJSON fill layer on the map.
 *
 * Uses MapLibre GL sources + layers:
 * - "solar-rows-fill" — semi-transparent orange fill
 * - "solar-rows-line" — dark orange stroke
 */

interface ArrayOverlayProps {
  map: maplibregl.Map | null;
  rows: ArrayRow[] | null;
  visible: boolean;
}

const FILL_COLOR = "#FF5A00";
const STROKE_COLOR = "#CC4800";
const FILL_OPACITY = 0.35;
const STROKE_WIDTH = 1.5;

const SOURCE_ID = "solar-rows";
const FILL_LAYER_ID = "solar-rows-fill";
const LINE_LAYER_ID = "solar-rows-line";

export function useArrayOverlay({ map, rows, visible }: ArrayOverlayProps) {
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!map) return;

    // Build GeoJSON FeatureCollection from rows
    const features: GeoJSON.Feature[] =
      rows && visible
        ? rows.map((row) => ({
            type: "Feature" as const,
            properties: { panelCount: row.panelCount, rowId: row.id },
            geometry: {
              type: "Polygon" as const,
              coordinates: [row.coordinates],
            },
          }))
        : [];

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features,
    };

    // Add or update source
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson);
    } else {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geojson,
      });

      // Fill layer (below labels but above raster)
      map.addLayer({
        id: FILL_LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": FILL_COLOR,
          "fill-opacity": FILL_OPACITY,
        },
      });

      // Line layer (stroke)
      map.addLayer({
        id: LINE_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": STROKE_COLOR,
          "line-width": STROKE_WIDTH,
          "line-opacity": 0.8,
        },
      });
    }

    // Cleanup function
    cleanupRef.current = () => {
      try {
        if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
        if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // ignore if already removed
      }
    };
  }, [map, rows, visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);
}
