import { fetchWeatherApi } from "openmeteo";
import type {
  SolarData,
  MonthlySolarData,
  AnnualAverages,
  LocationInfo,
  GeoLocation,
} from "@/types";

const API_URL = "https://historical-forecast-api.open-meteo.com/v1/forecast";

/** Order matters — must match indices in processHourly() */
const HOURLY_VARS = [
  "shortwave_radiation",       // 0 → GHI
  "direct_normal_irradiance",  // 1 → DNI
  "diffuse_radiation",         // 2 → DHI
  "temperature_2m",            // 3 → Temp
] as const;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function lastYearRange(): { start: string; end: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { start: fmt(start), end: fmt(end) };
}

interface DayBucket {
  ghiSum: number;   // Wh/m²
  dniSum: number;
  dhiSum: number;
  tempSum: number;
  hours: number;
}

interface ProcessedHourly {
  dailyMap: Map<string, DayBucket>; // key = "2025-01-15"
  timezone: string;
}

function processHourly(
  response: Awaited<ReturnType<typeof fetchWeatherApi>>[0]
): ProcessedHourly {
  const utcOffset = response.utcOffsetSeconds();
  const hourly = response.hourly()!;

  const ghiArr = hourly.variables(0)!.valuesArray()!;   // shortwave_radiation
  const dniArr = hourly.variables(1)!.valuesArray()!;   // direct_normal_irradiance
  const dhiArr = hourly.variables(2)!.valuesArray()!;   // diffuse_radiation
  const tempArr = hourly.variables(3)!.valuesArray()!;  // temperature_2m

  const interval = hourly.interval();
  // timeEnd - time = total span in seconds; ÷ interval = number of records
  const recordCount = Math.floor(Number(hourly.timeEnd() - hourly.time()) / interval);
  const startTime = Number(hourly.time());

  const tz = response.timezone() ?? response.timezoneAbbreviation() ?? `UTC${utcOffset >= 0 ? '+' : ''}${utcOffset / 3600}`;

  const dailyMap = new Map<string, DayBucket>();

  for (let i = 0; i < recordCount; i++) {
    const t = new Date((startTime + i * interval + utcOffset) * 1000);
    const key = t.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const ghi = ghiArr[i] ?? 0;
    const dni = dniArr[i] ?? 0;
    const dhi = dhiArr[i] ?? 0;
    const temp = tempArr[i] ?? 0;

    const existing = dailyMap.get(key);
    if (existing) {
      existing.ghiSum += ghi;
      existing.dniSum += dni;
      existing.dhiSum += dhi;
      existing.tempSum += temp;
      existing.hours++;
    } else {
      dailyMap.set(key, { ghiSum: ghi, dniSum: dni, dhiSum: dhi, tempSum: temp, hours: 1 });
    }
  }

  return { dailyMap, timezone: tz };
}

interface MonthBucket {
  ghiDailyAvg: number;  // Wh/m²/day
  dniDailyAvg: number;
  dhiDailyAvg: number;
  tempDailyAvg: number;
  days: number;
}

function dailyToMonthly(dailyMap: Map<string, DayBucket>): {
  monthly: MonthlySolarData[];
  annual: AnnualAverages;
} {
  const monthBuckets = new Map<string, MonthBucket>();

  for (const [dateStr, day] of dailyMap) {
    const monthIdx = new Date(dateStr).getMonth();
    const monthKey = MONTH_NAMES[monthIdx];

    // Daily averages from hourly
    const ghiDaily = day.hours > 0 ? day.ghiSum / day.hours : 0;   // W/m² avg
    const dniDaily = day.hours > 0 ? day.dniSum / day.hours : 0;
    const dhiDaily = day.hours > 0 ? day.dhiSum / day.hours : 0;
    const tempDaily = day.hours > 0 ? day.tempSum / day.hours : 0;

    // Convert W/m² average to daily Wh/m²: avg_W * 24h = daily Wh/m²
    // Then ÷ 1000 → kWh/m²/day
    const ghiKwh = (ghiDaily * 24) / 1000;
    const dniKwh = (dniDaily * 24) / 1000;
    const dhiKwh = (dhiDaily * 24) / 1000;

    const existing = monthBuckets.get(monthKey);
    if (existing) {
      existing.ghiDailyAvg += ghiKwh;
      existing.dniDailyAvg += dniKwh;
      existing.dhiDailyAvg += dhiKwh;
      existing.tempDailyAvg += tempDaily;
      existing.days++;
    } else {
      monthBuckets.set(monthKey, {
        ghiDailyAvg: ghiKwh,
        dniDailyAvg: dniKwh,
        dhiDailyAvg: dhiKwh,
        tempDailyAvg: tempDaily,
        days: 1,
      });
    }
  }

  const monthly: MonthlySolarData[] = MONTH_NAMES.map((month) => {
    const b = monthBuckets.get(month);
    if (!b || b.days === 0) {
      return { month, ghi: 0, dni: 0, dhi: 0, temperature: 0, psh: 0 };
    }
    return {
      month,
      ghi: round(b.ghiDailyAvg / b.days),
      dni: round(b.dniDailyAvg / b.days),
      dhi: round(b.dhiDailyAvg / b.days),
      temperature: round(b.tempDailyAvg / b.days),
      psh: round(b.ghiDailyAvg / b.days), // PSH = GHI in kWh/m²/day
    };
  });

  const withData = monthly.filter((m) => m.ghi > 0);
  const n = withData.length || 1;

  return {
    monthly,
    annual: {
      ghi: round(withData.reduce((s, m) => s + m.ghi, 0) / n),
      dni: round(withData.reduce((s, m) => s + m.dni, 0) / n),
      dhi: round(withData.reduce((s, m) => s + m.dhi, 0) / n),
      temperature: round(withData.reduce((s, m) => s + m.temperature, 0) / n),
      psh: round(withData.reduce((s, m) => s + m.psh, 0) / n),
    },
  };
}

export async function fetchSolarData(
  loc: GeoLocation,
  opts?: { tilt?: number; azimuth?: number }
): Promise<SolarData> {
  const { start, end } = lastYearRange();

  const params: Record<string, unknown> = {
    latitude: loc.lat,
    longitude: loc.lng,
    start_date: start,
    end_date: end,
    hourly: [...HOURLY_VARS],
  };

  // When tilt > 0, Open-Meteo returns plane-of-array irradiance
  // instead of GHI — more accurate for PV energy estimation.
  if (opts?.tilt != null && opts.tilt > 0) {
    params.tilt = opts.tilt;
    params.azimuth = opts.azimuth ?? (loc.lat >= 0 ? 180 : 0);
  }

  const [response] = await fetchWeatherApi(API_URL, params);

  const elevation = response.elevation() ?? 0;

  const { dailyMap, timezone } = processHourly(response);
  const { monthly, annual } = dailyToMonthly(dailyMap);

  const location: LocationInfo = {
    lat: loc.lat,
    lng: loc.lng,
    elevation,
    timezone,
  };

  return { location, monthly, annual };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
