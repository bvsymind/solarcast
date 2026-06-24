import { pdf } from "@react-pdf/renderer";
import { SolarReportPDF } from "./solar-report-pdf";
import type { SolarData, PvPanelParams, PvArrayConfig, PvDerivedValues, PvEnergyResult } from "@/types";

interface PdfData {
  solarData: SolarData;
  pvParams: PvPanelParams;
  pvConfig: PvArrayConfig;
  pvDerived: PvDerivedValues;
  pvEnergy: PvEnergyResult | null;
  locationName: string | null;
}

export async function generatePdfBlob(data: PdfData): Promise<Blob> {
  const { solarData, pvParams, pvConfig, pvDerived, pvEnergy, locationName } = data;
  return pdf(
    <SolarReportPDF
      solarData={solarData}
      pvParams={pvParams}
      pvConfig={pvConfig}
      pvDerived={pvDerived}
      pvEnergy={pvEnergy}
      locationName={locationName}
    />
  ).toBlob();
}
