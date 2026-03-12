import React from "react";
import { useNavigate } from "react-router-dom";
import useCourses from "../hooks/useCourses";
import { useAuth } from "../context/AuthContext";
import CoursesFilterBar from "../Components/courses/coursesTable/CoursesFilterBar";
import CoursesTable from "../Components/courses/coursesTable/CoursesTable";
import ConfirmModal from "../Components/ui/shared/ConfirmModal";
import CoursesStats from "../Components/courses/sections/CoursesStats";

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
    holes: Array.isArray(course?.holes) ? course.holes : [],
  };
}

const CoursesPage = () => {
  const { user } = useAuth();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const C = useCourses({ remote: !isCourseAdmin });
  const nav = useNavigate();
  const [confirm, setConfirm] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [courseAdminCourse, setCourseAdminCourse] = React.useState(null);
  const [courseAdminLoading, setCourseAdminLoading] = React.useState(isCourseAdmin);
  const [courseAdminError, setCourseAdminError] = React.useState("");
  const [holesModalOpen, setHolesModalOpen] = React.useState(false);
  const pageSize = 8;

  React.useEffect(() => {
    setPage(1);
  }, [C.query, C.status, C.sort]);

  const total = C.filtered.length;
  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return C.filtered.slice(start, start + pageSize);
  }, [C.filtered, page]);

  const stats = React.useMemo(() => {
    const totalCourses = C.rows.length;
    const activeCourses = C.rows.filter((r) => r.status === "active").length;
    const maintenanceCourses = C.rows.filter((r) => r.status === "maintenance").length;
    const uniqueAdminIds = new Set(C.rows.flatMap((r) => r.adminIds || []));

    return [
      {
        key: "total",
        title: "Total Courses",
        value: totalCourses,
        icon: "leaf",
        accent: "lime",
      },
      {
        key: "active",
        title: "Active Courses",
        value: activeCourses,
        icon: "check",
        accent: "cyan",
      },
      {
        key: "maintenance",
        title: "In Maintenance",
        value: maintenanceCourses,
        icon: "clock",
        accent: "violet",
      },
      {
        key: "admins",
        title: "Course Admins",
        value: uniqueAdminIds.size,
        icon: "users",
        accent: "pink",
      },
    ];
  }, [C.rows]);

  React.useEffect(() => {
    if (!isCourseAdmin) return;

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
  }, [isCourseAdmin]);

  if (isCourseAdmin) {
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
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Holes</p>
                <button
                  type="button"
                  onClick={() => setHolesModalOpen(true)}
                  className="mt-1 rounded-md border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  View
                </button>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => nav(`/courses/${row.id}/edit`)}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Edit Course
              </button>
            </div>
          </div>
        )}

        {holesModalOpen && row && (
          <div className="fixed inset-0 z-50 bg-black/35 p-4 sm:p-6">
            <div className="mx-auto mt-6 w-full max-w-2xl rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Holes - {row.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setHolesModalOpen(false)}
                  className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[65vh] overflow-auto p-4">
                {!Array.isArray(row.holes) || row.holes.length === 0 ? (
                  <p className="text-sm text-gray-500">No holes available for this course.</p>
                ) : (
                  <div className="space-y-3">
                    {row.holes.map((hole, index) => (
                      <div
                        key={`${hole?.hole || "hole"}-${index}`}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {hole?.hole || `Hole ${index + 1}`}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Coordinates: {hole?.coordinates || "-"}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Address: {hole?.address || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CoursesStats stats={stats} />

      <CoursesFilterBar
        query={C.query}
        setQuery={C.setQuery}
        status={C.status}
        setStatus={C.setStatus}
        sort={C.sort}
        setSort={C.setSort}
        onAdd={() => nav("/courses/new")} // route to full-page Add form
      />

      <h2 className="text-lg font-semibold text-gray-900">
        Manage Club Courses
      </h2>

      {C.error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {C.error}
        </div>
      )}

      <CoursesTable
        rows={pagedRows}
        loading={C.loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onToggle={C.toggleStatus}
        onEdit={(course) => nav(`/courses/${course.id}/edit`)}
        onDelete={(course) => setConfirm(course)}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!confirm}
        title="Delete Course"
        body={`Are you sure you want to delete “${confirm?.name}”? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => C.remove(confirm.id)}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
};

export default CoursesPage;
