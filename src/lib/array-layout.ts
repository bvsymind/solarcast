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
 * 1. Compute row pitch from GCR: P = L·cos(θ) / GCR  (clamped to min shading pitch)
 * 2. Distribute rows evenly across the full N–S extent of the polygon
 * 3. At each row latitude, find E–W spans by intersecting with polygon edges
 * 4. Place panels within each span
 */
export function fitPanelsInPolygon(
  polygonCoords: [number, number][],
  input: FeasibilityInput,
  panelPowerW: number,
  monthlySolar: MonthlySolarData[]
): FeasibilityResult {
  const area = computePolygonArea(polygonCoords);
  const gcr = input.groundCoverageRatio;

  const panelLengthM = input.panelLengthMm / 1000;
  const panelWidthM = input.panelWidthMm / 1000;
  const tiltRad = (input.tiltAngle * Math.PI) / 180;

  // Compute centroid for orientation decisions
  const centroid = polygonCentroid(polygonCoords);

  // Projected N–S footprint of one tilted row
  const projectedM = panelLengthM * Math.cos(tiltRad);

  // Minimum row pitch (to avoid winter solstice self-shading)
  const minPitchM = rowPitchMeters(panelLengthM, input.tiltAngle, centroid.lat);

  // Row pitch needed to achieve target GCR
  // GCR = projected / pitch  →  pitch = projected / GCR
  const gcrPitchM = projectedM / gcr;

  // Use the larger pitch (lower density wins — can't pack denser than shading allows)
  const actualPitchM = Math.max(gcrPitchM, minPitchM);
  const actualGcr = projectedM / actualPitchM;

  // Effective area based on actual GCR
  const effectiveArea = area * actualGcr;

  // Get lat bounds
  const lats = polygonCoords.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Convert units
  const mPerDegLat = metersPerDegLat();
  const mPerDegLng = metersPerDegLng(centroid.lat);
  const heightM = (maxLat - minLat) * mPerDegLat;

  // Determine row direction
  const isNorthern = centroid.lat >= 0;

  // Number of rows that fit in N–S extent with this pitch
  const numRows = Math.max(1, Math.floor(heightM / actualPitchM));

  // Half-height of a row in degrees (visual only — doesn't affect spacing)
  const rowHalfHeightDeg = projectedM / 2 / mPerDegLat;

  const rows: ArrayRow[] = [];
  let totalPanels = 0;

  // Distribute rows evenly across the N–S extent
  for (let r = 0; r < numRows; r++) {
    // Row center latitude — evenly spaced from north to south
    const rowCenterLat = isNorthern
      ? maxLat - ((r + 0.5) * actualPitchM) / mPerDegLat
      : minLat + ((r + 0.5) * actualPitchM) / mPerDegLat;

    // Find valid longitude spans at this latitude
    const spans = intersectPolygonAtLatitude(polygonCoords, rowCenterLat);

    const top = rowCenterLat + rowHalfHeightDeg;
    const bottom = rowCenterLat - rowHalfHeightDeg;

    for (const [lngStart, lngEnd] of spans) {
      const spanWidthDeg = lngEnd - lngStart;
      const spanWidthM = spanWidthDeg * mPerDegLng;
      const panelsInSpan = Math.floor(spanWidthM / panelWidthM);

      if (panelsInSpan <= 0) continue;

      const usedWidthM = panelsInSpan * panelWidthM;
      const usedWidthDeg = usedWidthM / mPerDegLng;
      const midLng = (lngStart + lngEnd) / 2;
      const halfUsed = usedWidthDeg / 2;

      rows.push({
        id: rows.length,
        coordinates: [
          [midLng - halfUsed, bottom],
          [midLng + halfUsed, bottom],
          [midLng + halfUsed, top],
          [midLng - halfUsed, top],
          [midLng - halfUsed, bottom],
        ],
        panelCount: panelsInSpan,
      });
      totalPanels += panelsInSpan;
    }
  }

  const installedCapacityKw = (totalPanels * panelPowerW) / 1000;

  // Energy estimation
  const energy = calcEnergy(installedCapacityKw, monthlySolar);

  return {
    polygonAreaM2: Math.round(area),
    effectiveAreaM2: Math.round(effectiveArea),
    panelCount: totalPanels,
    installedCapacityKw: Math.round(installedCapacityKw * 10) / 10,
    annualEnergyKwh: energy.annual,
    monthlyEnergy: energy.monthly,
    rows,
  };
}

/* ─── Geometry helpers ─── */

/**
 * Find all longitude spans where a horizontal line at `lat`
 * intersects the polygon. Returns sorted, non-overlapping [startLng, endLng] pairs.
 */
function intersectPolygonAtLatitude(
  polygonCoords: [number, number][],
  lat: number
): [number, number][] {
  const intersections: number[] = [];
  const n = polygonCoords.length;

  for (let i = 0; i < n; i++) {
    const [lng1, lat1] = polygonCoords[i];
    const [lng2, lat2] = polygonCoords[(i + 1) % n];

    // Check if the edge crosses the horizontal line
    const crosses =
      (lat1 <= lat && lat2 > lat) || (lat2 <= lat && lat1 > lat);

    if (crosses) {
      // Linear interpolation to find intersection longitude
      const t = (lat - lat1) / (lat2 - lat1);
      const lngIntersect = lng1 + t * (lng2 - lng1);
      intersections.push(lngIntersect);
    }

    // Edge exactly on the line — include both endpoints
    if (lat2 === lat && lat1 !== lat) {
      // The next edge will handle this vertex
    }
  }

  // Sort intersections by longitude
  intersections.sort((a, b) => a - b);

  // Pair them up: each pair is an inside span
  const spans: [number, number][] = [];
  for (let i = 0; i < intersections.length - 1; i += 2) {
    if (i + 1 < intersections.length) {
      const start = intersections[i];
      const end = intersections[i + 1];
      // Skip degenerate spans
      if (Math.abs(end - start) > 1e-9) {
        spans.push([start, end]);
      }
    }
  }

  return spans;
}

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
