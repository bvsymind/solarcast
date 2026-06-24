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
}
