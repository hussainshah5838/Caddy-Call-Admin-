import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { palette } from "../../../utils/theme";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm">
      <div className="font-medium text-gray-900">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-gray-700">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.fill }}
          />
          {p.name}: <span className="ml-1 font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const RegistrationByRoleChart = React.memo(function RegistrationByRoleChart({
  data,
  names = { golfers: "Golfers", staff: "Staff" },
}) {
  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="h-64 sm:h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            name={names.golfers}
            dataKey="golfers"
            fill={palette.primary}
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
          <Bar
            name={names.staff}
            dataKey="staff"
            fill={palette.gold}
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RegistrationByRoleChart;
