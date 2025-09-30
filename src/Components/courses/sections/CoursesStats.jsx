import React, { useMemo } from "react";
import CourseStatCard from "../stats/CourseStatCard";

const CoursesStats = React.memo(function CoursesStats({ stats = [] }) {
  const items = useMemo(() => stats, [stats]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((s) => (
          <CourseStatCard key={s.key} {...s} />
        ))}
      </div>
    </section>
  );
});

export default CoursesStats;
