import type { FeasibilityInput, FeasibilityResult, ArrayRow, MonthlySolarData } from "@/types";
import { calcEnergy } from "./pv-calculator";

/* ─── Constants ─── */

const EARTH_RADIUS_M = 6_371_000;

/* ─── Polygon area (spherical / geodesic) ─── */

/**
 * Compute approximate geodesic area (m²) of a GeoJSON polygon ring
 * using spherical excess formula (good for sub-100km polygons).
 */
export function computePolygonArea(coords: [number, number][]): number {
  if (coords.length < 3) return 0;

  // Close ring if not already
  const ring =
    coords[0][0] === coords[coords.length - 1][0] &&
    coords[0][1] === coords[coords.length - 1][1]
      ? coords
      : [...coords, coords[0]];

  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    // Convert to radians
    const λ1 = (lng1 * Math.PI) / 180;
    const λ2 = (lng2 * Math.PI) / 180;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    area += λ2 * Math.sin(φ1) - λ1 * Math.sin(φ2);
  }
  area = (Math.abs(area) / 2) * EARTH_RADIUS_M ** 2;
  return area;
}

/* ─── Coordinate offsets ─── */

/** Approx meters per degree at a given latitude */
function metersPerDegLng(lat: number): number {
  return (Math.PI / 180) * EARTH_RADIUS_M * Math.cos((lat * Math.PI) / 180);
}

function metersPerDegLat(): number {
  return (Math.PI / 180) * EARTH_RADIUS_M;
}

/** Offset a coordinate by dx meters east, dy meters north */
export function offsetCoord(
  lng: number,
  lat: number,
  dxMeters: number,
  dyMeters: number
): [number, number] {
  const dLng = dxMeters / metersPerDegLng(lat);
  const dLat = dyMeters / metersPerDegLat();
  return [lng + dLng, lat + dLat];
}

/* ─── Row orientation & spacing ─── */

/**
 * Optimal azimuth for fixed-tilt panels.
 * Northern hemisphere → south (180°), Southern → north (0°).
 */
export function optimalAzimuth(lat: number): number {
  return lat >= 0 ? 180 : 0;
}

/**
 * Row pitch (center-to-center spacing between rows) in meters.
 * Includes panel projected length + winter solstice shadow gap.
 *
 * panelLengthM = panel length in meters (the tilted dimension)
 * tiltDeg = panel tilt from horizontal
 * lat = latitude
 */
export function rowPitchMeters(
  panelLengthM: number,
  tiltDeg: number,
  lat: number
): number {
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const latRad = (Math.abs(lat) * Math.PI) / 180;

  // Projected horizontal length of panel
  const projected = panelLengthM * Math.cos(tiltRad);

  // Winter solstice sun elevation at noon (approx)
  const declination = -23.45; // winter solstice
  const declRad = (declination * Math.PI) / 180;
  const sunElevation = Math.PI / 2 - latRad + declRad;
  const minSunElevation = Math.max(sunElevation, 0.17); // clamp to ~10°

  // Shadow length behind panel
  const shadowGap =
    panelLengthM * Math.sin(tiltRad) / Math.tan(minSunElevation);

  return projected + shadowGap;
}

/* ─── Panel fitting ─── */

/**
 * Fit solar panel rows inside a polygon, oriented south-facing.
 *
 * Strategy:
 * 1. Find the bounding box of the polygon in meters
 * 2. Place rows from the back (north edge for NH, south edge for SH)
 * 3. For each row, test which segments intersect the polygon
 * 4. Place panels along the row within the polygon
 */
export function fitPanelsInPolygon(
  polygonCoords: [number, number][],
  input: FeasibilityInput,
  panelPowerW: number,
  monthlySolar: MonthlySolarData[]
): FeasibilityResult {
  const area = computePolygonArea(polygonCoords);
  const effectiveArea = area * input.groundCoverageRatio;

  const panelLengthM = input.panelLengthMm / 1000;
  const panelWidthM = input.panelWidthMm / 1000;

  // Compute centroid for orientation decisions
  const centroid = polygonCentroid(polygonCoords);
  const pitch = rowPitchMeters(panelLengthM, input.tiltAngle, centroid.lat);

  // Get bounds in lat/lng
  const lats = polygonCoords.map((c) => c[1]);
  const lngs = polygonCoords.map((c) => c[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Convert bounds to meters from centroid
  const mPerDegLat = metersPerDegLat();
  const mPerDegLng = metersPerDegLng(centroid.lat);

  const heightM = (maxLat - minLat) * mPerDegLat;
  const widthM = (maxLng - minLng) * mPerDegLng;

  // Determine row direction
  // South-facing: rows run E–W. North edge is farther from equator.
  const isNorthern = centroid.lat >= 0;

  // Row length = E–W dimension (widthM)
  // Number of rows = N–S dimension / pitch
  const maxRows = Math.floor(heightM / pitch);
  if (maxRows <= 0) {
    return {
      polygonAreaM2: Math.round(area),
      effectiveAreaM2: Math.round(effectiveArea),
      panelCount: 0,
      installedCapacityKw: 0,
      annualEnergyKwh: 0,
      monthlyEnergy: monthlySolar.map((m) => ({ month: m.month, energy: 0 })),
      rows: [],
    };
  }

  // Panels per row = row length / panel width (panels are oriented portrait with long side along row, or landscape)
  // Standard: long side (length) faces south along the tilt, short side (width) runs E–W along the row
  const panelsPerRow = Math.floor(widthM / panelWidthM);

  const rows: ArrayRow[] = [];
  let totalPanels = 0;

  for (let r = 0; r < maxRows; r++) {
    // Row center latitude (start from north edge going south for NH)
    const rowCenterLat = isNorthern
      ? maxLat - ((r + 0.5) * pitch) / mPerDegLat
      : minLat + ((r + 0.5) * pitch) / mPerDegLat;

    // Row spans from minLng to rowCenterLat - width/2 to rowCenterLat + width/2
    // But we clip to polygon. For simplification, use full bounding box width clipped by polygon.
    const rowHalfWidth = (panelsPerRow * panelWidthM) / 2;

    const rowCenterLng = centroid.lng;
    const leftLng = rowCenterLng - rowHalfWidth / mPerDegLng;
    const rightLng = rowCenterLng + rowHalfWidth / mPerDegLng;

    // Row polygon (rectangle in geographic coords)
    const rowHalfHeight = (panelLengthM * Math.cos((input.tiltAngle * Math.PI) / 180)) / 2 / mPerDegLat;
    const top = rowCenterLat + rowHalfHeight;
    const bottom = rowCenterLat - rowHalfHeight;

    // Clip row to polygon (simple centroid check for now)
    const rowMidLng = (leftLng + rightLng) / 2;
    if (pointInPolygon([rowMidLng, rowCenterLat], polygonCoords)) {
      rows.push({
        id: r,
        coordinates: [
          [leftLng, bottom],
          [rightLng, bottom],
          [rightLng, top],
          [leftLng, top],
          [leftLng, bottom],
        ],
        panelCount: panelsPerRow,
      });
      totalPanels += panelsPerRow;
    }
  }

  // Apply GCR cap
  const maxPanelsByGcr = Math.floor(effectiveArea / (panelLengthM * panelWidthM));
  const panelCount = Math.min(totalPanels, maxPanelsByGcr);
  const installedCapacityKw = (panelCount * panelPowerW) / 1000;

  // Energy estimation
  const energy = calcEnergy(installedCapacityKw, monthlySolar);

  return {
    polygonAreaM2: Math.round(area),
    effectiveAreaM2: Math.round(effectiveArea),
    panelCount,
    installedCapacityKw: Math.round(installedCapacityKw * 10) / 10,
    annualEnergyKwh: energy.annual,
    monthlyEnergy: energy.monthly,
    rows: panelCount > 0 ? rows.slice(0, Math.ceil(panelCount / (panelsPerRow || 1))) : [],
  };
}

/* ─── Geometry helpers ─── */

function polygonCentroid(coords: [number, number][]): { lat: number; lng: number } {
  let lngSum = 0;
  let latSum = 0;
  const n = coords.length;
  for (const [lng, lat] of coords) {
    lngSum += lng;
    latSum += lat;
  }
  return { lng: lngSum / n, lat: latSum / n };
}

/** Ray-casting point-in-polygon test */
function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const [x, y] = point;
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Check if a rectangular row (defined by 4 corner coords)
 * intersects the polygon. Uses centroid point-in-polygon check
 * (sufficient for small rows relative to polygon size).
 */
export function rowIntersectsPolygon(
  rowCoords: [number, number][],
  polygonCoords: [number, number][]
): boolean {
  // Check centroid
  const cx = rowCoords.slice(0, 4).reduce((s, c) => s + c[0], 0) / 4;
  const cy = rowCoords.slice(0, 4).reduce((s, c) => s + c[1], 0) / 4;
  return pointInPolygon([cx, cy], polygonCoords);
}
