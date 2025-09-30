import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { palette } from "../../../utils/theme";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm">
      <div className="font-medium text-gray-900">{label}</div>
      <div className="text-gray-600">${v?.toLocaleString?.() ?? v}</div>
    </div>
  );
};

const RevenueTrendChart = React.memo(function RevenueTrendChart({ data }) {
  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="h-64 sm:h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={rows}
          margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fill: palette.axis, fontSize: 12 }}
            axisLine={{ stroke: palette.grid }}
            tickLine={{ stroke: palette.grid }}
          />
          <YAxis
            tick={{ fill: palette.axis, fontSize: 12 }}
            axisLine={{ stroke: palette.grid }}
            tickLine={{ stroke: palette.grid }}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={palette.primary}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RevenueTrendChart;
