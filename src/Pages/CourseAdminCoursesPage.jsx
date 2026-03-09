import React from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function mapCourseAdminCourse(course) {
  const open = course?.hours?.open || "";
  const close = course?.hours?.close || "";
  const coords = course?.map?.coordinates;
  const mapUrl =
    Array.isArray(coords) && coords.length === 2
      ? `https://www.google.com/maps?q=${coords[1]},${coords[0]}`
      : course?.map?.address
      ? `https://www.google.com/maps?q=${encodeURIComponent(course.map.address)}`
      : "#";

  return {
    id: String(course?._id || ""),
    name: course?.courseName || "",
    photo: course?.photo || "",
    location: course?.location?.address || "",
    status:
      String(course?.status || "").toLowerCase() === "maintenance"
        ? "maintenance"
        : "active",
    hours: open && close ? `${open} - ${close}` : open || close || "-",
    mapUrl,
    dueDate: course?.dueDate ? new Date(course.dueDate).toISOString().slice(0, 10) : "",
    taxRate: course?.taxRate ?? "",
    deliveryFee: course?.deliveryFee ?? "",
  };
}

export default function CourseAdminCoursesPage() {
  const nav = useNavigate();
  const [courseAdminCourse, setCourseAdminCourse] = React.useState(null);
  const [courseAdminLoading, setCourseAdminLoading] = React.useState(true);
  const [courseAdminError, setCourseAdminError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    const fetchMyCourse = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (mounted) {
          setCourseAdminCourse(null);
          setCourseAdminError("Authentication token not found.");
          setCourseAdminLoading(false);
        }
        return;
      }

      if (mounted) {
        setCourseAdminLoading(true);
        setCourseAdminError("");
      }

      try {
        const response = await fetch(`${API_BASE_URL}/courses/my-course`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.course) {
          throw new Error(data?.message || "Failed to fetch your course details.");
        }
        if (mounted) {
          setCourseAdminCourse(mapCourseAdminCourse(data.course));
        }
      } catch (err) {
        if (mounted) {
          setCourseAdminCourse(null);
          setCourseAdminError(err?.message || "Failed to fetch your course details.");
        }
      } finally {
        if (mounted) setCourseAdminLoading(false);
      }
    };

    fetchMyCourse();

    return () => {
      mounted = false;
    };
  }, []);

  const row = courseAdminCourse;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Course</h1>
        <p className="text-sm text-gray-500">
          View your assigned course details.
        </p>
      </div>

      {courseAdminError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {courseAdminError}
        </div>
      )}

      {courseAdminLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading course details...
        </div>
      ) : !row ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          No course details available.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {row.photo ? (
                  <img
                    src={row.photo}
                    alt={row.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{row.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{row.location || "-"}</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                row.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {row.status === "active" ? "Active" : "Maintenance"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Location</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{row.location || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Operating Hours</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{row.hours || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Map</p>
              <a
                href={row.mapUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm font-medium text-emerald-700 hover:underline"
              >
                Open Location
              </a>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {row.dueDate || "-"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Tax Rate</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {row.taxRate === "" ? "-" : `${row.taxRate}%`}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Delivery Fee</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {row.deliveryFee === "" ? "-" : `$${row.deliveryFee}`}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => nav(`/course-admin/courses/${row.id}/edit`)}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Edit Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
