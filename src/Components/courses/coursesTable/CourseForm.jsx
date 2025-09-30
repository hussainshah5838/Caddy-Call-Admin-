import React, { useEffect } from "react";
import { MdAccessTime, MdMap } from "react-icons/md";

const selectCls =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";
const inputCls =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export default function CourseForm({ open, initial, onCancel, onSubmit }) {
  const [form, setForm] = React.useState({
    name: "",
    location: "",
    status: "active",
    hours: "",
    admins: [],
    mapUrl: "",
  });

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, ...(initial || {}) }));
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-auto bg-black/30 p-4">
      <div className="mt-8 w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Add Courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Course Name
            </label>
            <input
              className={inputCls}
              placeholder="Enter Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          {/* location */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Location</label>
            <input
              className={inputCls}
              placeholder="Street 25 House…"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>
          {/* status */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              className={selectCls}
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          {/* hours */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hours</label>
            <div className="relative">
              <MdAccessTime className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                className={inputCls}
                placeholder="6:00 am to 10:00 am"
                value={form.hours}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hours: e.target.value }))
                }
              />
            </div>
          </div>
          {/* map */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Map</label>
            <div className="relative">
              <MdMap className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                className={inputCls}
                placeholder="Map URL"
                value={form.mapUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mapUrl: e.target.value }))
                }
              />
            </div>
          </div>
          {/* admins (comma separated demo) */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Assigned Admins
            </label>
            <input
              className={inputCls}
              placeholder="/a1.jpg, /a2.jpg"
              value={(form.admins || []).join(", ")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  admins: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit?.(form)}
            className="px-4 py-2 rounded-md bg-[#0d3b2e] text-white hover:opacity-95"
          >
            Add course
          </button>
        </div>
      </div>
    </div>
  );
}
