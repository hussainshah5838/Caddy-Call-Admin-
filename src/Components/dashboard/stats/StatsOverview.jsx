import React, { useMemo } from "react";
import StatCard from "./StatCard";

export default function StatsOverview({ title = "Super Admin Dashboard", stats = [] }) {
  const items = useMemo(() => stats, [stats]);
  const gridColsClass = useMemo(() => {
    if (items.length === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
    return "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4";
  }, [items.length]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        {title}
      </h1>

      <div>
        <h2 className="text-sm font-medium text-gray-800">Platform Overview</h2>
      </div>

      <div className={gridColsClass}>
        {items.map((s) => (
          <StatCard key={s.key} {...s} />
        ))}
      </div>
    </section>
  );
}
