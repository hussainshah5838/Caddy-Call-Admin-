import React, { useEffect, useState, useMemo } from "react";
import {
  MdKeyboardArrowDown,
  MdCalendarToday,
  MdClose,
  MdAddAPhoto,
} from "react-icons/md";

const input =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600";
const select =
  "w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export default function UserUpsertForm({
  mode = "create",
  value,
  courseOptions = [],
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    photo: null,
    email: "",
    course: "",
    role: "Admin",
    status: "active",
    lastActivity: "",
  });
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (value) {
      setForm((f) => ({ ...f, ...value }));
      if (typeof value?.photo === "string") setPhotoUrl(value.photo);
    }
  }, [value]);

  const canSubmit = useMemo(() => form.email && form.course, [form]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">
        {mode === "edit" ? "Edit User" : "Add Users"}
      </h1>

      {/* Photo */}
      <div className="md:col-span-3">
        <div className="relative w-28 h-28 rounded-full border-2 border-[#0d3b2e] grid place-items-center overflow-hidden">
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border grid place-items-center"
                onClick={() => {
                  setPhotoUrl("");
                  setForm((f) => ({ ...f, photo: null }));
                }}
              >
                <MdClose className="text-gray-600" />
              </button>
            </>
          ) : (
            <div className="text-center">
              <MdAddAPhoto className="mx-auto h-6 w-6 text-gray-500" />
              <div className="text-[12px] text-gray-700 font-medium mt-1">
                Photo
              </div>
            </div>
          )}
        </div>
        <label className="inline-flex mt-3 text-sm font-medium text-[#0d3b2e] cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              if (photoUrl && photoUrl.startsWith("blob:"))
                URL.revokeObjectURL(photoUrl);
              setPhotoUrl(url);
              setForm((f) => ({ ...f, photo: file }));
            }}
          />
          Upload
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Fields */}
        <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              User
            </label>
            <input
              className={input}
              placeholder="john@gmail.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                className={select}
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option>Admin</option>
                <option>Golfer</option>
                <option>Kitchen Staff</option>
                <option>Beverage Cart Staff</option>
                <option>Marshal</option>
              </select>
              <MdKeyboardArrowDown className="absolute right-2.5 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              Course
            </label>
            <div className="relative">
              <select
                className={select}
                value={form.course}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course: e.target.value }))
                }
              >
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-2.5 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                className={select}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <MdKeyboardArrowDown className="absolute right-2.5 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              Last Activity
            </label>
            <div className="relative">
              <input
                type="date"
                className={input}
                value={form.lastActivity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastActivity: e.target.value }))
                }
              />
              <MdCalendarToday className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="md:col-span-2 mt-2 flex items-center gap-4">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-200 px-6 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit?.(form)}
              className={`rounded-md px-6 py-2.5 text-sm text-white ${
                canSubmit
                  ? "bg-[#0d3b2e] hover:opacity-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {mode === "edit" ? "Save changes" : "Add course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
