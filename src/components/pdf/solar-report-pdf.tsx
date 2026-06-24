"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  SolarData,
  PvPanelParams,
  PvArrayConfig,
  PvDerivedValues,
  PvEnergyResult,
} from "@/types";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
      fontWeight: 700,
    },
  ],
});

/* ─── Styles ─── */

const c = {
  orange: "#FF5A00",
  sky: "#6FC8F3",
  gray900: "#111827",
  gray600: "#4B5563",
  gray400: "#9CA3AF",
  gray100: "#F3F4F6",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    color: c.gray900,
    padding: 40,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: `2px solid ${c.orange}`,
    paddingBottom: 20,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 700, color: c.gray900, marginBottom: 2 },
  subtitle: { fontSize: 10, color: c.orange, fontWeight: 700, marginTop: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: c.orange,
    marginTop: 18,
    marginBottom: 8,
    borderBottom: `1px solid ${c.gray100}`,
    paddingBottom: 4,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, color: c.gray600, fontSize: 9 },
  value: { fontWeight: 700, fontSize: 9 },
  table: { marginTop: 4 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: c.orange,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderText: { color: c.white, fontWeight: 700, fontSize: 8, flex: 1 },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${c.gray100}`,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: `1px solid ${c.gray100}`,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#FFF7F0",
  },
  tableCell: { flex: 1, fontSize: 8 },
  tableCellBold: { flex: 1, fontSize: 8, fontWeight: 700 },
  metricCard: {
    backgroundColor: "#FFF7F0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  metricRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  metricLabel: { fontSize: 9, color: c.gray600 },
  metricValue: { fontSize: 12, fontWeight: 700, color: c.orange },
  tag: {
    backgroundColor: c.gray100,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 7,
    color: c.gray600,
    marginRight: 4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: c.gray400,
    textAlign: "center",
    borderTop: `1px solid ${c.gray100}`,
    paddingTop: 8,
  },
  twoCol: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
});

interface SolarReportPDFProps {
  solarData: SolarData;
  pvParams: PvPanelParams;
  pvConfig: PvArrayConfig;
  pvDerived: PvDerivedValues;
  pvEnergy: PvEnergyResult | null;
  locationName: string | null;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function MetricHighlight({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontSize: 8, color: c.gray600, marginBottom: 2 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: 700, color: c.orange }}>
        {value}
      </Text>
      <Text style={{ fontSize: 7, color: c.gray400 }}>{unit}</Text>
    </View>
  );
}

export function SolarReportPDF({
  solarData,
  pvParams,
  pvConfig,
  pvDerived,
  pvEnergy,
  locationName,
}: SolarReportPDFProps) {
  const { location, monthly, annual } = solarData;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Solarcast</Text>
            <Text style={styles.subtitle}>SOLAR ENERGY POTENTIAL REPORT</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8, color: c.gray400 }}>
              Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </Text>
            <Text style={{ fontSize: 8, color: c.gray400 }}>
              Data: Open-Meteo API
            </Text>
          </View>
        </View>

        {/* ── Location ── */}
        <SectionTitle>1. Location</SectionTitle>
        {locationName && (
          <InfoRow label="Location" value={locationName} />
        )}
        <InfoRow label="Latitude" value={`${location.lat}°`} />
        <InfoRow label="Longitude" value={`${location.lng}°`} />
        <InfoRow
          label="Elevation"
          value={location.elevation != null ? `${Math.round(location.elevation)} m` : "N/A"}
        />
        <InfoRow label="Timezone" value={location.timezone ?? "N/A"} />
        <InfoRow
          label="Coordinates"
          value={`${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°`}
        />

        {/* ── Solar Resource ── */}
        <SectionTitle>2. Solar Resource — Annual Averages</SectionTitle>
        <View style={styles.metricCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <MetricHighlight label="GHI" value={annual.ghi.toFixed(2)} unit="kWh/m²/day" />
            <MetricHighlight label="DNI" value={annual.dni.toFixed(2)} unit="kWh/m²/day" />
            <MetricHighlight label="DHI" value={annual.dhi.toFixed(2)} unit="kWh/m²/day" />
            <MetricHighlight label="Temperature" value={`${annual.temperature.toFixed(1)}°`} unit="°C" />
            <MetricHighlight label="Peak Sun Hours" value={annual.psh.toFixed(2)} unit="hours/day" />
          </View>
        </View>

        {/* Monthly table */}
        <Text style={{ fontSize: 9, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>
          Monthly Breakdown
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Month</Text>
            <Text style={styles.tableHeaderText}>GHI</Text>
            <Text style={styles.tableHeaderText}>DNI</Text>
            <Text style={styles.tableHeaderText}>DHI</Text>
            <Text style={styles.tableHeaderText}>Temp (°C)</Text>
            <Text style={styles.tableHeaderText}>PSH</Text>
          </View>
          {monthly.map((m, i) => (
            <View key={m.month} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellBold}>{m.month}</Text>
              <Text style={styles.tableCell}>{m.ghi > 0 ? m.ghi.toFixed(2) : "—"}</Text>
              <Text style={styles.tableCell}>{m.dni > 0 ? m.dni.toFixed(2) : "—"}</Text>
              <Text style={styles.tableCell}>{m.dhi > 0 ? m.dhi.toFixed(2) : "—"}</Text>
              <Text style={styles.tableCell}>{m.temperature > 0 ? m.temperature.toFixed(1) : "—"}</Text>
              <Text style={styles.tableCell}>{m.psh > 0 ? m.psh.toFixed(2) : "—"}</Text>
            </View>
          ))}
        </View>

        {/* ── PV Configuration ── */}
        <View break />
        <SectionTitle>3. PV System Configuration</SectionTitle>
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
              Panel Specifications
            </Text>
            <InfoRow label="Rated Power" value={`${pvParams.power} W`} />
            <InfoRow label="Vmp" value={`${pvParams.vmp} V`} />
            <InfoRow label="Voc" value={`${pvParams.voc} V`} />
            <InfoRow label="Imp" value={`${pvParams.imp} A`} />
            <InfoRow label="Isc" value={`${pvParams.isc} A`} />
            <InfoRow label="α Isc" value={`${pvParams.alphaIsc} %/°C`} />
            <InfoRow label="β Voc" value={`${pvParams.betaVoc} %/°C`} />
          </View>
          <View style={styles.col}>
            <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
              Array Configuration
            </Text>
            <InfoRow label="Series Panels (Nₛ)" value={`${pvConfig.nSeries}`} />
            <InfoRow label="Parallel Strings (Nₚ)" value={`${pvConfig.nParallel}`} />
            <InfoRow label="Total Panels" value={`${pvConfig.nSeries * pvConfig.nParallel}`} />
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
                Derived Values
              </Text>
              <InfoRow label="Array Voltage" value={`${pvDerived.vArray.toFixed(1)} V`} />
              <InfoRow label="Array Current" value={`${pvDerived.iArray.toFixed(1)} A`} />
              <InfoRow
                label="Installed Capacity"
                value={`${(pvDerived.pArray / 1000).toFixed(2)} kWp`}
              />
            </View>
          </View>
        </View>

        {/* ── Energy Estimation ── */}
        <SectionTitle>4. Energy Production Estimate</SectionTitle>
        {pvEnergy ? (
          <>
            <View style={styles.metricCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                <MetricHighlight
                  label="Annual Energy"
                  value={`${(pvEnergy.annual / 1000).toFixed(2)}`}
                  unit="MWh/year"
                />
                <MetricHighlight
                  label="Capacity Factor"
                  value={`${pvEnergy.capacityFactor}`}
                  unit="%"
                />
                <MetricHighlight
                  label="Performance Ratio"
                  value="0.80"
                  unit="PR"
                />
                <MetricHighlight
                  label="Installed Capacity"
                  value={`${(pvDerived.pArray / 1000).toFixed(2)}`}
                  unit="kWp"
                />
              </View>
            </View>

            <Text style={{ fontSize: 9, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>
              Monthly Energy Production
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Month</Text>
                <Text style={styles.tableHeaderText}>Energy (kWh)</Text>
                <Text style={styles.tableHeaderText}>PSH (h/day)</Text>
                <Text style={styles.tableHeaderText}>Days</Text>
              </View>
              {pvEnergy.monthly.map((m, i) => {
                const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i];
                const psh = monthly[i]?.psh ?? 0;
                return (
                  <View key={m.month} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={styles.tableCellBold}>{m.month}</Text>
                    <Text style={styles.tableCell}>{m.energy.toLocaleString()}</Text>
                    <Text style={styles.tableCell}>{psh.toFixed(2)}</Text>
                    <Text style={styles.tableCell}>{days}</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <Text style={{ fontSize: 9, color: c.gray400 }}>
            Select a location and configure PV parameters to generate energy estimates.
          </Text>
        )}

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Solarcast — Renewable Energy Potential Dashboard · Powered by Open-Meteo API · Built
          with Next.js & MapLibre GL · {new Date().getFullYear()}
        </Text>
      </Page>
    </Document>
  );
}
