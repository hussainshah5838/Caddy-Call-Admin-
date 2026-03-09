import React, { useMemo, useCallback, useState } from "react";
import CourseCard from "../courses/CourseCard";
import ActivityFeed from "../activity/ActivityFeed";

/** Layout matches the screenshot: 3 cards per row on xl, 2 on md, 1 on mobile, with an activity sidebar on the right at large screens. */
const CoursePerformance = React.memo(function CoursePerformance({
  courses = [],
  activity = [],
}) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const items = useMemo(() => courses, [courses]);
  const act = useMemo(() => activity, [activity]);

  const handleView = useCallback((course) => {
    setSelectedCourse(course || null);
  }, []);

  const formatDate = (value) => {
    if (!value) return "N/A";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString();
  };

  const formatHours = (hours) => {
    if (!hours?.open || !hours?.close) return "N/A";
    return `${hours.open} - ${hours.close}`;
  };

  const formatCurrency = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return "N/A";
    return `$${n.toLocaleString()}`;
  };

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

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
              <img
                src={selectedCourse.image}
                alt={selectedCourse.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCourse.name}
                </h3>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  {selectedCourse.status}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Revenue:</span> ${Number(selectedCourse.revenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">
                  {selectedCourse.staff !== undefined ? "Staff:" : "Bookings:"}
                </span>{" "}
                {selectedCourse.staff !== undefined ? selectedCourse.staff : selectedCourse.bookings}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Course Admins:</span>{" "}
                {selectedCourse.assignedAdmins?.length
                  ? selectedCourse.assignedAdmins.map((a) => a?.name).filter(Boolean).join(", ")
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Hours:</span> {formatHours(selectedCourse.hours)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Location:</span> {selectedCourse.location || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Tax Rate:</span>{" "}
                {selectedCourse.taxRate !== null && selectedCourse.taxRate !== undefined
                  ? `${selectedCourse.taxRate}%`
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Delivery Charges:</span>{" "}
                {selectedCourse.deliveryFee !== null && selectedCourse.deliveryFee !== undefined
                  ? formatCurrency(selectedCourse.deliveryFee)
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Due Date:</span> {formatDate(selectedCourse.dueDate)}
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

export default CoursePerformance;
