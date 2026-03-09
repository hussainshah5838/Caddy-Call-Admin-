import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdMoreVert, MdEdit, MdDelete, MdToggleOn, MdToggleOff } from "react-icons/md";
import Pagination from "../ui/shared/Pagination";
import ConfirmModal from "../ui/shared/ConfirmModal";

/* ---- status → color ---- */
const statusColor = {
  active: "text-emerald-600",
  inactive: "text-rose-600",
  pending: "text-amber-600",
};

/* ---- role pill with fixed color map (no dynamic Tailwind strings) ---- */
const roleColorMap = {
  blue:    "bg-blue-50 text-blue-700 ring-blue-100",
  violet:  "bg-violet-50 text-violet-700 ring-violet-100",
  indigo:  "bg-indigo-50 text-indigo-700 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber:   "bg-amber-50 text-amber-700 ring-amber-100",
  kitchen: "bg-[#A855F733] text-[#6B21A8] ring-[#A855F733]",
  bevcart: "bg-[#F9731633] text-[#9A3412] ring-[#F9731633]",
  golfer:  "bg-[#22C55E33] text-[#166534] ring-[#22C55E33]",
  courseadmin: "bg-[#3B82F633] text-[#1E40AF] ring-[#3B82F633]",
};

const RolePill = ({ children, color = "indigo" }) => {
  const classes = roleColorMap[color] || roleColorMap.indigo;
  return (
    <span className={`inline-flex items-center rounded-full ${classes} text-xs px-2 py-1 ring-1`}>
      {children}
    </span>
  );
};

function getRoleBadgeColor(role = "", index = 0) {
  const normalized = String(role).trim().toLowerCase();
  if (normalized.includes("course admin")) return "courseadmin";
  if (normalized.includes("golfer")) return "golfer";
  if (normalized.includes("kitchen")) return "kitchen";
  if (normalized.includes("beverage cart")) return "bevcart";
  return index % 3 === 0 ? "blue" : index % 3 === 1 ? "violet" : "amber";
}

/* ---- row action menu ---- */
function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside?.();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    // Close on Escape as well
    const onKey = (e) => {
      if (e.key === "Escape") onOutside?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [onOutside]);
  return ref;
}

function RowMenu({ currentStatus, onEdit, onToggleStatus, onAskDelete, onClose }) {
  const ref = useClickOutside(onClose);
  const isActive = String(currentStatus).toLowerCase() === "active";
  return (
    <div
      ref={ref}
      className="absolute right-0 top-9 z-40 w-36 rounded-md border border-gray-200 bg-white shadow-md pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => { onEdit?.(); onClose?.(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <MdEdit className="h-4 w-4 text-gray-500" /> Edit
      </button>
      <button
        type="button"
        onClick={() => { onToggleStatus?.(); onClose?.(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-amber-50 text-amber-700"
      >
        {isActive ? (
          <MdToggleOff className="h-4 w-4" />
        ) : (
          <MdToggleOn className="h-4 w-4" />
        )}
        {isActive ? "Inactive" : "Active"}
      </button>
      <button
        type="button"
        onClick={() => { onAskDelete?.(); onClose?.(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-rose-50 text-rose-600"
      >
        <MdDelete className="h-4 w-4" /> Delete
      </button>
    </div>
  );
}

export default function UsersTable({
  rows,
  loading = false,
  total,
  page,
  pageSize,
  onPageChange,
  showCourseColumn = true,
  onEdit,   // (user) => void
  onToggleStatus, // (id, currentStatus) => void
  onDelete, // (user) => void
}) {
  const data = useMemo(() => rows || [], [rows]);

  // which row's menu is open
  const [openMenuId, setOpenMenuId] = useState(null);
  // which row we’re confirming deletion for
  const [confirmRow, setConfirmRow] = useState(null);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm relative">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              {showCourseColumn && (
                <th className="px-4 py-3 font-medium">Course</th>
              )}
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Activity</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={showCourseColumn ? 6 : 5} className="px-4 py-10 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Loading users...
                  </div>
                </td>
              </tr>
            )}

            {data.map((u, idx) => (
              <tr key={u.id} className="border-t border-gray-100 relative">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <div className="text-gray-900 font-medium">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.roles.map((r, i) => (
                      <RolePill
                        key={i}
                        color={getRoleBadgeColor(r, i)}
                      >
                        {r}
                      </RolePill>
                    ))}
                  </div>
                </td>
                {showCourseColumn && (
                  <td className="px-4 py-3 text-gray-700">{u.course}</td>
                )}
                <td className="px-4 py-3">
                  <span className={`font-medium ${statusColor[u.status] || "text-gray-600"}`}>
                    • {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.lastActivity}</td>
                <td className="px-2 py-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      className="p-2 rounded-md hover:bg-gray-50 text-gray-600"
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === u.id}
                      aria-label={`Actions for ${u.name}`}
                    >
                      <MdMoreVert className="h-5 w-5" />
                    </button>

                    {openMenuId === u.id && (
                      <RowMenu
                        currentStatus={u.status}
                        onEdit={() => onEdit?.(u)}
                        onToggleStatus={() => onToggleStatus?.(u.id, u.status)}
                        onAskDelete={() => setConfirmRow(u)}
                        onClose={() => setOpenMenuId(null)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={showCourseColumn ? 6 : 5} className="px-4 py-10 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden divide-y divide-gray-100">
        {loading && (
          <div className="p-6 text-center text-gray-500 text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              Loading users...
            </div>
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">No users found.</div>
        )}
        {data.map((u) => (
          <div key={u.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <div className="text-gray-900 font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                  className="p-2 rounded-md hover:bg-gray-50 text-gray-600"
                  aria-label={`Actions for ${u.name}`}
                >
                  <MdMoreVert className="h-5 w-5" />
                </button>
                {openMenuId === u.id && (
                  <RowMenu
                    currentStatus={u.status}
                    onEdit={() => onEdit?.(u)}
                    onToggleStatus={() => onToggleStatus?.(u.id, u.status)}
                    onAskDelete={() => setConfirmRow(u)}
                    onClose={() => setOpenMenuId(null)}
                  />
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>{u.course}</span>
                <span className={`${statusColor[u.status]}`}>• {u.status}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {u.roles.map((r, i) => (
                  <RolePill
                    key={i}
                    color={getRoleBadgeColor(r, i)}
                  >
                    {r}
                  </RolePill>
                ))}
              </div>
              <div className="mt-1 text-gray-400">Last: {u.lastActivity}</div>
            </div>
          </div>
        ))}
      </div>

      {/* footer: pagination */}
      <div className="border-top border-gray-100 px-3 py-3">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        open={!!confirmRow}
        title="Delete User"
        body={`Are you sure you want to delete “${confirmRow?.name}”? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => onDelete?.(confirmRow)}
        onClose={() => setConfirmRow(null)}
      />
    </div>
  );
}
