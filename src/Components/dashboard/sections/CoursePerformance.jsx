import React, { useMemo, useCallback } from "react";
import CourseCard from "../courses/CourseCard";
import ActivityFeed from "../activity/ActivityFeed";

/** Layout matches the screenshot: 3 cards per row on xl, 2 on md, 1 on mobile, with an activity sidebar on the right at large screens. */
const CoursePerformance = React.memo(function CoursePerformance({
  courses = [],
  activity = [],
}) {
  const items = useMemo(() => courses, [courses]);
  const act = useMemo(() => activity, [activity]);

  const handleView = useCallback((course) => {
    // plug your navigation or drawer open here
    console.log("View course:", course.id);
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-800">
        Course Performance & Activity Feed
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* cards */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((c) => (
              <CourseCard key={c.id} course={c} onView={handleView} />
            ))}
          </div>
        </div>

        {/* activity sidebar */}
        <div className="lg:col-span-3">
          <ActivityFeed items={act} />
        </div>
      </div>
    </section>
  );
});

export default CoursePerformance;
