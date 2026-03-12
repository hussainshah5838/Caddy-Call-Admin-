import React, { useMemo } from "react";
import { MdContentCopy, MdEdit, MdDelete } from "react-icons/md";
import Pagination from "../../ui/shared/Pagination";

const pill = (status) => (status === "active" ? "text-emerald-600" : "text-amber-600");

/**
 * Props:
 * - rows: array of course objects for the CURRENT page
 * - total: total count across all pages
 * - page, pageSize
 * - onPageChange(newPage)
 * - onToggle(id), onEdit(course), onDelete(course)
 */
export default function CoursesTable({
  rows,
  loading = false,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onToggle,
  onEdit,
  onDelete,
}) {
  const data = useMemo(() => rows || [], [rows]);
  const [holesModalCourse, setHolesModalCourse] = React.useState(null);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white">
      {/* TABLE (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Course Name</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Hours</th>
              <th className="px-4 py-3 font-medium">Map</th>
              <th className="px-4 py-3 font-medium">Holes</th>
              <th className="px-4 py-3 font-medium">Assigned Admins</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Loading courses...
                  </div>
                </td>
              </tr>
            )}

            {data.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{c.order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt=""
                        className="h-6 w-6 rounded-full bg-gray-100 object-cover"
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
                    {/* toggle */}
                    <button
                      onClick={() => onToggle?.(c.id)}
                      className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition
                        ${c.status === "active" ? "bg-emerald-600" : "bg-gray-300"}`}
                      title="Toggle status"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                          ${c.status === "active" ? "translate-x-4" : "translate-x-1"}`}
                      />
                    </button>
                    <span className={`font-medium ${pill(c.status)}`}>
                      {c.status === "active" ? "Active" : "Maintenance"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{c.hours}</td>
                <td className="px-4 py-3">
                  <a href={c.mapUrl} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
                    <MdContentCopy className="h-4 w-4" /> Map
                  </a>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setHolesModalCourse(c)}
                    className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex -space-x-2">
                    {(c.admins || []).map((src, i) => (
                      <img key={i} src={src} alt="" className="h-7 w-7 rounded-full border-2 border-white object-cover" />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-gray-500">
                    <button onClick={() => onEdit?.(c)} className="hover:text-gray-700" title="Edit">
                      <MdEdit className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete?.(c)} className="hover:text-rose-600" title="Delete">
                      <MdDelete className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST (smaller than md) */}
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
          <div className="p-6 text-center text-gray-400 text-sm">No courses found.</div>
        )}

        {data.map((c) => (
          <div key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt=""
                    className="h-8 w-8 rounded-full bg-gray-100 object-cover"
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
                    <img key={i} src={src} alt="" className="h-6 w-6 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <a href={c.mapUrl} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800">
                  <MdContentCopy className="h-4 w-4" /> Map
                </a>
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => setHolesModalCourse(c)}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Holes
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => onToggle?.(c.id)}
                className={`relative inline-flex h-5 w-10 cursor-pointer items-center rounded-full transition
                  ${c.status === "active" ? "bg-emerald-600" : "bg-gray-300"}`}
                title="Toggle status"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                    ${c.status === "active" ? "translate-x-5" : "translate-x-1"}`}
                />
              </button>
              <button onClick={() => onEdit?.(c)} className="px-3 py-1.5 rounded-md border border-gray-200 text-sm">
                Edit
              </button>
              <button onClick={() => onDelete?.(c)} className="px-3 py-1.5 rounded-md border border-rose-200 text-sm text-rose-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER: Pagination */}
      <div className="border-t border-gray-100 px-3 py-3">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      </div>

      {holesModalCourse && (
        <div className="fixed inset-0 z-50 bg-black/35 p-4 sm:p-6">
          <div className="mx-auto mt-6 w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-base font-semibold text-gray-900">
                Holes - {holesModalCourse.name}
              </h3>
              <button
                type="button"
                onClick={() => setHolesModalCourse(null)}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto p-4">
              {!Array.isArray(holesModalCourse.holes) ||
              holesModalCourse.holes.length === 0 ? (
                <p className="text-sm text-gray-500">No holes available for this course.</p>
              ) : (
                <div className="space-y-3">
                  {holesModalCourse.holes.map((hole, index) => (
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
