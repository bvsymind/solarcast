import type {
  PvPanelParams,
  PvArrayConfig,
  PvDerivedValues,
  PvEnergyResult,
  MonthlySolarData,
} from "@/types";

/* ─── Derive array values ─── */

export function calcDerivedValues(
  params: PvPanelParams,
  config: PvArrayConfig
): PvDerivedValues {
  return {
    vArray: params.vmp * config.nSeries,
    iArray: params.imp * config.nParallel,
    pArray: params.power * config.nSeries * config.nParallel,
  };
}

/* ─── Temperature & irradiance correction ─── */

export function tempCorrectVoc(
  voc: number,
  betaVoc: number,
  cellTemp: number,
  baseTemp: number
): number {
  const deltaT = cellTemp - baseTemp;
  return voc * (1 + (betaVoc / 100) * deltaT);
}

export function tempCorrectIsc(
  isc: number,
  alphaIsc: number,
  cellTemp: number,
  baseTemp: number
): number {
  const deltaT = cellTemp - baseTemp;
  return isc * (1 + (alphaIsc / 100) * deltaT);
}

export function irradianceCorrectPower(
  ratedPower: number,
  irradiance: number,
  baseIrradiance: number
): number {
  return ratedPower * (irradiance / baseIrradiance);
}

/* ─── Energy estimation ─── */

const DEFAULT_PR = 0.8; // Performance Ratio

export function calcEnergy(
  installedCapacityKw: number,
  monthly: MonthlySolarData[],
  pr: number = DEFAULT_PR
): PvEnergyResult {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const monthlyEnergy = monthly.map((m, i) => {
    // Energy (kWh) = Capacity (kW) × PSH (h) × days × PR
    const energy = installedCapacityKw * m.psh * daysInMonth[i] * pr;
    return {
      month: m.month,
      energy: Math.round(energy),
    };
  });

  const annual = monthlyEnergy.reduce((s, m) => s + m.energy, 0);
  const capacityFactor =
    installedCapacityKw > 0
      ? (annual / (installedCapacityKw * 8760)) * 100
      : 0;

  return {
    monthly: monthlyEnergy,
    annual: Math.round(annual),
    capacityFactor: Math.round(capacityFactor * 10) / 10,
  };
}
