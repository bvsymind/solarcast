"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthlySolarData } from "@/types";

interface IrradianceChartProps {
  data: MonthlySolarData[];
}

export function IrradianceChart({ data }: IrradianceChartProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="mb-3 text-xs font-medium text-gray-500">
        Monthly Irradiance (kWh/m²/day)
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 0, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f3f5"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
            />
            <Bar
              dataKey="ghi"
              name="GHI"
              fill="#FF5A00"
              radius={[3, 3, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="dni"
              name="DNI"
              fill="#FF8C42"
              radius={[3, 3, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="dhi"
              name="DHI"
              fill="#6FC8F3"
              radius={[3, 3, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
