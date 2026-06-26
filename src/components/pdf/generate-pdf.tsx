import { pdf } from "@react-pdf/renderer";
import { SolarReportPDF } from "./solar-report-pdf";
import type {
  SolarData,
  PvPanelParams,
  PvArrayConfig,
  PvDerivedValues,
  PvEnergyResult,
  FeasibilityInput,
  FeasibilityResult,
} from "@/types";

interface PdfData {
  solarData: SolarData;
  pvParams: PvPanelParams;
  pvConfig: PvArrayConfig;
  pvDerived: PvDerivedValues;
  pvEnergy: PvEnergyResult | null;
  locationName: string | null;
  feasibilityInput: FeasibilityInput | null;
  feasibilityResult: FeasibilityResult | null;
  mapSnapshot: string | null;
}

export async function generatePdfBlob(data: PdfData): Promise<Blob> {
  const {
    solarData,
    pvParams,
    pvConfig,
    pvDerived,
    pvEnergy,
    locationName,
    feasibilityInput,
    feasibilityResult,
    mapSnapshot,
  } = data;
  return pdf(
    <SolarReportPDF
      solarData={solarData}
      pvParams={pvParams}
      pvConfig={pvConfig}
      pvDerived={pvDerived}
      pvEnergy={pvEnergy}
      locationName={locationName}
      feasibilityInput={feasibilityInput}
      feasibilityResult={feasibilityResult}
      mapSnapshot={mapSnapshot}
    />
  ).toBlob();
}
