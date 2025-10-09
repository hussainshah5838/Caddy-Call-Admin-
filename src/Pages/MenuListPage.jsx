import React from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdContentCopy, MdVisibility } from "react-icons/md";
import { seed } from "../Data/MenuList";

// pill helper for status color
const pill = (status) =>
  status === "active"
    ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded"
    : "text-amber-700 bg-amber-50 px-2 py-0.5 rounded";

// minimal Pagination stub (plug in your real one later)
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

export default function MenuListPage() {
  const navigate = useNavigate();

  // state you likely already have
  const [data, setData] = React.useState(seed);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const total = data.length;

  const onToggle = (id) => {
    setData((rows) =>
      rows.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "active" ? "maintenance" : "active" }
          : r
      )
    );
  };

  const onEdit = (row) => {
    // your existing edit flow / drawer
    console.log("edit", row);
  };

  const onDelete = (row) => {
    // your delete flow
    setData((rows) => rows.filter((r) => r.id !== row.id));
  };

  const onView = (row) => {
    navigate(`/menu/${row.id}`); // <-- open protected management page
  };

  const onPageChange = (p) => setPage(p);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white">
      {/* TABLE (md and up) */}
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
            {data.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{c.order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100" />
                    <div className="text-gray-900">{c.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.location}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* toggle */}
                    <button
                      onClick={() => onToggle(c.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                        c.status === "active" ? "bg-emerald-600" : "bg-gray-300"
                      }`}
                      title="Toggle status"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          c.status === "active"
                            ? "translate-x-4"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
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

            {data.length === 0 && (
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

      {/* MOBILE LIST (smaller than md) */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">
            No courses found.
          </div>
        )}

        {data.map((c) => (
          <div key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100" />
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
                onClick={() => onToggle(c.id)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                  c.status === "active" ? "bg-emerald-600" : "bg-gray-300"
                }`}
                title="Toggle status"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    c.status === "active" ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
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

      {/* FOOTER: Pagination */}
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
