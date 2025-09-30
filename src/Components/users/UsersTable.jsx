import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdMoreVert, MdEdit, MdDelete } from "react-icons/md";
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
};

const RolePill = ({ children, color = "indigo" }) => {
  const classes = roleColorMap[color] || roleColorMap.indigo;
  return (
    <span className={`inline-flex items-center rounded-full ${classes} text-xs px-2 py-1 ring-1`}>
      {children}
    </span>
  );
};

/* ---- row action menu ---- */
function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside?.();
    }
    // Use pointerdown to handle both mouse and touch reliably
    document.addEventListener("pointerdown", handler);
    // Close on Escape as well
    const onKey = (e) => {
      if (e.key === "Escape") onOutside?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [onOutside]);
  return ref;
}

function RowMenu({ onEdit, onAskDelete, onClose }) {
  const ref = useClickOutside(onClose);
  return (
    <div
      ref={ref}
      className="absolute right-0 top-9 z-40 w-36 rounded-md border border-gray-200 bg-white shadow-md"
    >
      <button
        onClick={() => { onEdit?.(); onClose?.(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <MdEdit className="h-4 w-4 text-gray-500" /> Edit
      </button>
      <button
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
  total,
  page,
  pageSize,
  onPageChange,
  onEdit,   // (user) => void
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
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Activity</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
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
                        color={i % 3 === 0 ? "blue" : i % 3 === 1 ? "violet" : "amber"}
                      >
                        {r}
                      </RolePill>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{u.course}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${statusColor[u.status] || "text-gray-600"}`}>
                    • {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.lastActivity}</td>
                <td className="px-2 py-3">
                  <div className="relative">
                    <button
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
                        onEdit={() => onEdit?.(u)}
                        onAskDelete={() => setConfirmRow(u)}
                        onClose={() => setOpenMenuId(null)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.length === 0 && (
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
                  onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                  className="p-2 rounded-md hover:bg-gray-50 text-gray-600"
                  aria-label={`Actions for ${u.name}`}
                >
                  <MdMoreVert className="h-5 w-5" />
                </button>
                {openMenuId === u.id && (
                  <RowMenu
                    onEdit={() => onEdit?.(u)}
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
                    color={i % 3 === 0 ? "blue" : i % 3 === 1 ? "violet" : "amber"}
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
