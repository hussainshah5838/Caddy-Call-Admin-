import React from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdContentCopy, MdVisibility } from "react-icons/md";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toAvatar(name = "Admin") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E5E7EB&color=111827&size=64`;
}

function mapCourseRow(course, index) {
  const open = course?.hours?.open || "";
  const close = course?.hours?.close || "";
  const assignedAdmins = Array.isArray(course?.assignedAdmins)
    ? course.assignedAdmins
    : [];

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
    admins: assignedAdmins.map((a) => toAvatar(a?.name || "Admin")),
    mapUrl: "#",
    order: index + 1,
  };
}

const pill = (status) =>
  status === "active"
    ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded"
    : "text-amber-700 bg-amber-50 px-2 py-0.5 rounded";

const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const pages = Math.max(1, Math.ceil((total || 0) / (pageSize || 10)));
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-gray-500">
        Page {page} of {pages}
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded border border-gray-200"
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <button
          className="px-3 py-1 rounded border border-gray-200"
          onClick={() => onPageChange?.(Math.min(pages, page + 1))}
          disabled={page >= pages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default function ProShopListPage() {
  const navigate = useNavigate();

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const total = data.length;

  React.useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (!mounted) return;
        setData([]);
        setLoading(false);
        setError("Authentication token not found.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const resData = await response.json().catch(() => ({}));
        if (!response.ok || !resData?.success || !Array.isArray(resData?.courses)) {
          throw new Error(resData?.message || "Failed to fetch courses.");
        }

        if (!mounted) return;
        setData(resData.courses.map((course, index) => mapCourseRow(course, index)));
      } catch (err) {
        if (!mounted) return;
        setData([]);
        setError(err?.message || "Failed to fetch courses.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchCourses();
    return () => {
      mounted = false;
    };
  }, []);

  const onEdit = (row) => {
    console.log("edit", row);
  };

  const onDelete = (row) => {
    setData((rows) => rows.filter((r) => r.id !== row.id));
  };

  const onView = (row) => {
    navigate(`/pro-shop/${row.id}`);
  };

  const onPageChange = (p) => setPage(p);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white">
      {error && (
        <div className="m-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Hours</th>
              <th className="px-4 py-3 font-medium">View Details</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Loading courses...
                  </div>
                </td>
              </tr>
            )}

            {(loading ? [] : data).map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{c.order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt={c.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-100" />
                    )}
                    <div className="text-gray-900">{c.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.location}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${pill(c.status)}`}>
                      {c.status === "active" ? "Active" : "Maintenance"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{c.hours}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center gap-3 text-gray-500">
                    <button
                      onClick={() => onView(c)}
                      className="hover:text-gray-700"
                      title="View"
                    >
                      <MdVisibility className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-100">
        {loading && (
          <div className="p-6 text-center text-gray-500 text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              Loading courses...
            </div>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">
            No courses found.
          </div>
        )}

        {(loading ? [] : data).map((c) => (
          <div key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-100" />
                )}
                <div>
                  <div className="text-gray-900 font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.location}</div>
                </div>
              </div>
              <div className={`text-xs font-medium ${pill(c.status)}`}>
                {c.status === "active" ? "Active" : "Maintenance"}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <div className="text-gray-500">Hours</div>
                <div className="text-gray-800">{c.hours}</div>
              </div>
              <div>
                <div className="text-gray-500">Admins</div>
                <div className="flex -space-x-2 mt-1">
                  {(c.admins || []).slice(0, 4).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-6 w-6 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <a
                  href={c.mapUrl}
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <MdContentCopy className="h-4 w-4" /> Map
                </a>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => onView(c)}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm"
              >
                View
              </button>
              <button
                onClick={() => onEdit(c)}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(c)}
                className="px-3 py-1.5 rounded-md border border-rose-200 text-sm text-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 px-3 py-3">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
