import React, { useMemo } from "react";
import StatCard from "./StatCard";

export default function StatsOverview({ stats = [] }) {
  const items = useMemo(() => stats, [stats]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        Super Admin Dashboard
      </h1>

      <div>
        <h2 className="text-sm font-medium text-gray-800">Platform Overview</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((s) => (
          <StatCard key={s.key} {...s} />
        ))}
      </div>
    </section>
  );
}
