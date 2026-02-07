"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

type Point = {
  date: string;
  volume: number;
  average_volume: number;
  color: string;
};

export function ChartVolume({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        No volume data in the selected date range.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: "#5c6370" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#5c6370" }}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #eee" }}
            formatter={(value: number, name: string) => [
              value.toFixed(0),
              name === "volume" ? "Volume" : "Average",
            ]}
            labelFormatter={(label) => {
              const d = chartData.find((c) => c.displayDate === label);
              return d ? d.date : label;
            }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#e67e22"
            strokeWidth={2}
            dot={({ cx, cy, payload }) => (
              <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={payload?.color === "Above Average" ? "#e67e22" : "#94a3b8"}
              />
            )}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="average_volume"
            stroke="#0d9488"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
