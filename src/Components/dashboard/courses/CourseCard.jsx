import React from "react";
import { money } from "../../../utils/format";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  Maintenance: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  Inactive: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

const CourseCard = React.memo(function CourseCard({ course, onView }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* image */}
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">
            {course.name}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              statusStyles[course.status] || statusStyles.Inactive
            }`}
          >
            {course.status}
          </span>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm text-gray-600">
            <span className="text-gray-500">Revenue:</span>{" "}
            {money(course.revenue)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="text-gray-500">Bookings:</span> {course.bookings}
          </p>
        </div>

        <button
          onClick={() => onView?.(course)}
          className="mt-4 w-full rounded-lg bg-[#0d3b2e] text-white text-sm font-medium py-2.5 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
        >
          View Details
        </button>
      </div>
    </div>
  );
});

export default CourseCard;
