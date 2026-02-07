"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = { date: string; one_rep_max: number };

export function Chart1RM({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        No data for this exercise in the selected date range.
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
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: "#5c6370" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#5c6370" }}
            tickLine={false}
            tickFormatter={(v) => `${v} lbs`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #eee" }}
            formatter={(value: number) => [`${value.toFixed(2)} lbs`, "1 Rep Max"]}
            labelFormatter={(label) => {
              const d = chartData.find((c) => c.displayDate === label);
              return d ? d.date : label;
            }}
          />
          <Line
            type="monotone"
            dataKey="one_rep_max"
            stroke="#e67e22"
            strokeWidth={2}
            dot={{ fill: "#e67e22", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
