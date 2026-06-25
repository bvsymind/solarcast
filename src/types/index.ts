export interface GeoLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface LocationInfo extends GeoLocation {
  elevation: number | null;
  timezone: string | null;
}

export interface MonthlySolarData {
  month: string; // "Jan" … "Dec"
  ghi: number; // kWh/m²/day
  dni: number;
  dhi: number;
  temperature: number; // °C
  psh: number; // hours/day
}

export interface AnnualAverages {
  ghi: number;
  dni: number;
  dhi: number;
  temperature: number;
  psh: number;
}

export interface SolarData {
  location: LocationInfo;
  monthly: MonthlySolarData[];
  annual: AnnualAverages;
}

export interface PvPanelParams {
  power: number;       // W — rated panel power
  vmp: number;         // V — max power voltage
  voc: number;         // V — open circuit voltage
  imp: number;         // A — max power current
  isc: number;         // A — short circuit current
  alphaIsc: number;    // %/°C — temperature coefficient for Isc
  betaVoc: number;     // %/°C — temperature coefficient for Voc
  deltaVoc: number;    // V/°C — voltage correction for irradiance
  baseTemp: number;    // °C — base temperature (default 25)
  baseIrradiance: number; // W/m² — base irradiance (default 1000)
}

export interface PvArrayConfig {
  nSeries: number;     // panels in series
  nParallel: number;   // parallel strings
}

export interface PvDerivedValues {
  vArray: number;      // V — array voltage
  iArray: number;      // A — array current
  pArray: number;      // W — array power (installed capacity)
}

export interface PvEnergyResult {
  monthly: { month: string; energy: number }[]; // kWh/month
  annual: number;      // kWh/year
  capacityFactor: number; // %
}

/* ─── Feasibility (Polygon-based) ─── */

export interface FeasibilityInput {
  panelLengthMm: number;  // mm — panel long side (row direction)
  panelWidthMm: number;   // mm — panel short side
  groundCoverageRatio: number; // 0–1 — fraction of land covered by panels
  tiltAngle: number;       // degrees — panel tilt from horizontal
}

export interface FeasibilityResult {
  polygonAreaM2: number;        // total area of the drawn polygon
  effectiveAreaM2: number;      // area × GCR
  panelCount: number;           // number of panels that fit
  installedCapacityKw: number;  // kWp
  annualEnergyKwh: number;      // kWh/year
  monthlyEnergy: { month: string; energy: number }[];
  rows: ArrayRow[];             // computed panel rows for overlay
}

export interface ArrayRow {
  id: number;
  // Bounding rectangle of the row (in geographic coords)
  coordinates: [number, number][]; // GeoJSON polygon ring (5 points: 4 corners + close)
  panelCount: number;
}

export interface DashboardState {
  selectedLocation: GeoLocation | null;
  locationInfo: LocationInfo | null;
  locationName: string | null;
  solarData: SolarData | null;
  isLoading: boolean;
  error: string | null;
  // PV
  pvParams: PvPanelParams;
  pvConfig: PvArrayConfig;
  pvDerived: PvDerivedValues | null;
  pvEnergy: PvEnergyResult | null;
  setSelectedLocation: (loc: GeoLocation) => void;
  setLocationInfo: (info: LocationInfo) => void;
  setSolarData: (data: SolarData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPvParams: (params: Partial<PvPanelParams>) => void;
  setPvConfig: (config: Partial<PvArrayConfig>) => void;
  recalcPv: () => void;
  // Feasibility (polygon-based)
  feasibilityInput: FeasibilityInput;
  feasibilityResult: FeasibilityResult | null;
  feasibilityPolygon: GeoJSON.Polygon | null;
  drawMode: boolean;
  setFeasibilityInput: (input: Partial<FeasibilityInput>) => void;
  setFeasibilityPolygon: (polygon: GeoJSON.Polygon | null) => void;
  setDrawMode: (active: boolean) => void;
  recalcFeasibility: () => void;
}
