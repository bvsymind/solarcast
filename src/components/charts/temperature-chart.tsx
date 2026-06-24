"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlySolarData } from "@/types";

interface TemperatureChartProps {
  data: MonthlySolarData[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="mb-3 text-xs font-medium text-gray-500">
        Average Temperature (°C)
      </p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 0, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6FC8F3" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6FC8F3" stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
              unit="°"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#6FC8F3"
              strokeWidth={2}
              fill="url(#tempGradient)"
              dot={{
                r: 2,
                fill: "#6FC8F3",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 4,
                fill: "#6FC8F3",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
