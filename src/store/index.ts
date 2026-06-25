import { create } from "zustand";
import type { DashboardState, PvPanelParams, PvArrayConfig } from "@/types";
import { calcDerivedValues, calcEnergy } from "@/lib/pv-calculator";
import { fitPanelsInPolygon } from "@/lib/array-layout";

const DEFAULT_PV_PARAMS: PvPanelParams = {
  power: 400,
  vmp: 41.1,
  voc: 49.3,
  imp: 9.74,
  isc: 10.36,
  alphaIsc: 0.06,
  betaVoc: -0.35,
  deltaVoc: 0,
  baseTemp: 25,
  baseIrradiance: 1000,
};

const DEFAULT_PV_CONFIG: PvArrayConfig = {
  nSeries: 10,
  nParallel: 5,
};

const DEFAULT_FEASIBILITY_INPUT = {
  panelLengthMm: 2000,
  panelWidthMm: 1000,
  groundCoverageRatio: 0.5,
  tiltAngle: 20,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  selectedLocation: null,
  locationInfo: null,
  solarData: null,
  isLoading: false,
  error: null,
  locationName: null,

  pvParams: { ...DEFAULT_PV_PARAMS },
  pvConfig: { ...DEFAULT_PV_CONFIG },
  pvDerived: calcDerivedValues(DEFAULT_PV_PARAMS, DEFAULT_PV_CONFIG),
  pvEnergy: null,

  // Feasibility
  feasibilityInput: { ...DEFAULT_FEASIBILITY_INPUT },
  feasibilityResult: null,
  feasibilityPolygon: null,
  drawMode: false,

  setSelectedLocation: (loc) =>
    set({ selectedLocation: loc, locationName: loc.name ?? null, error: null }),

  setLocationInfo: (info) =>
    set({ locationInfo: info }),

  setSolarData: (data) =>
    set({ solarData: data, isLoading: false, error: null }, false),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (err) =>
    set({ error: err, isLoading: false }),

  setPvParams: (partial) => {
    set((s) => ({ pvParams: { ...s.pvParams, ...partial } }));
    get().recalcPv();
  },

  setPvConfig: (partial) => {
    set((s) => ({ pvConfig: { ...s.pvConfig, ...partial } }));
    get().recalcPv();
  },

  recalcPv: () => {
    const { pvParams, pvConfig, solarData } = get();
    const derived = calcDerivedValues(pvParams, pvConfig);
    const energy =
      solarData?.monthly
        ? calcEnergy(derived.pArray / 1000, solarData.monthly)
        : null;
    set({ pvDerived: derived, pvEnergy: energy });
  },

  setFeasibilityInput: (partial) => {
    set((s) => ({
      feasibilityInput: { ...s.feasibilityInput, ...partial },
    }));
    get().recalcFeasibility();
  },

  setFeasibilityPolygon: (polygon) => {
    set({ feasibilityPolygon: polygon, drawMode: false });
    if (polygon) {
      get().recalcFeasibility();
    } else {
      set({ feasibilityResult: null });
    }
  },

  setDrawMode: (active) =>
    set({ drawMode: active }),

  recalcFeasibility: () => {
    const { feasibilityPolygon, feasibilityInput, pvParams, solarData } = get();
    if (!feasibilityPolygon || !solarData?.monthly) {
      set({ feasibilityResult: null });
      return;
    }
    const result = fitPanelsInPolygon(
      feasibilityPolygon.coordinates[0] as [number, number][],
      feasibilityInput,
      pvParams.power,
      solarData.monthly
    );
    set({ feasibilityResult: result });
  },
}));

// Recalc when solarData loads (called from useSolarDataQuery)
const origSetSolarData = useDashboardStore.getState().setSolarData;
useDashboardStore.setState({
  setSolarData: (data) => {
    origSetSolarData(data);
    // Trigger recalc after state is set
    setTimeout(() => {
      useDashboardStore.getState().recalcPv();
      useDashboardStore.getState().recalcFeasibility();
    }, 0);
  },
});
