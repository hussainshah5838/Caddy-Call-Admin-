import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MdAccessTime,
  MdMap,
  MdCalendarToday,
  MdKeyboardArrowDown,
  MdClose,
  MdAddAPhoto,
} from "react-icons/md";
import Field from "./Field";

// simple input/select styles to match your UI
const inputCls =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b2e]/70";
const selectCls =
  "w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b2e]/70";
const iconRightCls = "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400";

// tiny avatar group pill
function AvatarGroup({ srcs = [] }) {
  if (!srcs.length)
    return <span className="text-gray-400 text-sm">Select admins</span>;
  return (
    <div className="flex -space-x-2">
      {srcs.slice(0, 4).map((s, i) => (
        <img
          key={i}
          src={s}
          alt=""
          className="h-6 w-6 rounded-full border-2 border-white object-cover"
        />
      ))}
      {srcs.length > 4 && (
        <span className="h-6 w-6 rounded-full bg-gray-100 text-[11px] grid place-items-center border-2 border-white">
          +{srcs.length - 4}
        </span>
      )}
    </div>
  );
}

export default function CourseUpsertForm({
  mode = "create",
  value,
  adminOptions = [], // [{id, name, avatar}]
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    status: "active", // active | maintenance
    hours: "",
    map: "",
    dueDate: "",
    admins: [], // array of avatar urls (or ids; up to you)
    photo: null, // File or URL
  });

  // preview for the circular photo
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (value) {
      setForm((f) => ({
        ...f,
        ...value,
      }));
      setPhotoUrl(typeof value?.photo === "string" ? value.photo : "");
    }
  }, [value]);

  // cleanup object URL
  useEffect(() => {
    return () => {
      if (photoUrl && photoUrl.startsWith("blob:"))
        URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Course" : "Add Courses";

  const onPickPhoto = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      // cleanup old blob if any
      if (photoUrl && photoUrl.startsWith("blob:"))
        URL.revokeObjectURL(photoUrl);
      setPhotoUrl(url);
      setForm((f) => ({ ...f, photo: file }));
    },
    [photoUrl]
  );

  const removePhoto = useCallback(() => {
    if (photoUrl && photoUrl.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    setPhotoUrl("");
    setForm((f) => ({ ...f, photo: null }));
  }, [photoUrl]);

  const toggleAdmin = useCallback((opt) => {
    setForm((f) => {
      // using avatar string as id; change to opt.id if you prefer
      const key = opt.avatar;
      const set = new Set(f.admins);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...f, admins: Array.from(set) };
    });
  }, []);

  const canSubmit = useMemo(
    () => form.name.trim() && form.location.trim(),
    [form.name, form.location]
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">{title}</h1>
      {/* Photo circle */}
      <div className="md:col-span-3">
        <div className="relative w-28 h-28 rounded-full border-2 border-[#0d3b2e] grid place-items-center overflow-hidden">
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt="Course"
                className="h-full w-full object-cover"
              />
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-gray-200 grid place-items-center shadow"
                title="Remove"
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
            onChange={onPickPhoto}
          />
          Upload
        </label>
      </div>
      <br />
      {/* Top row: circular photo on left + grid on right (on small screens it stacks) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Form grid */}
        <div className="md:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Course Name">
              <input
                className={inputCls}
                placeholder="Enter Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>

            <Field label="Location">
              <div className="relative">
                <input
                  className={inputCls}
                  placeholder="Street 25 House 2333 blue area"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
                <MdKeyboardArrowDown className={iconRightCls} />
              </div>
            </Field>

            <Field label="Status">
              <div className="relative">
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
                <MdKeyboardArrowDown className={iconRightCls} />
              </div>
            </Field>

            <Field label="Hours">
              <div className="relative">
                <input
                  className={inputCls}
                  placeholder="6:00 am to 10:00 am"
                  value={form.hours}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hours: e.target.value }))
                  }
                />
                <MdAccessTime className={iconRightCls} />
              </div>
            </Field>

            <Field label="Map">
              <div className="relative">
                <input
                  className={inputCls}
                  placeholder="Abc location"
                  value={form.map}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, map: e.target.value }))
                  }
                />
                <MdMap className={iconRightCls} />
              </div>
            </Field>

            <Field label="Assigned Admins">
              {/* simple select dropdown with avatar preview */}
              <div className="relative">
                <div
                  className={`${inputCls} flex items-center justify-between`}
                >
                  <AvatarGroup srcs={form.admins} />
                  <MdKeyboardArrowDown className="text-gray-400" />
                </div>
                {/* Menu */}
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm max-h-56 overflow-auto">
                  {adminOptions.map((a) => {
                    const active = form.admins.includes(a.avatar);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAdmin(a)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                          active ? "bg-emerald-50" : ""
                        }`}
                      >
                        <img
                          src={a.avatar}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="flex-1 text-left text-gray-800">
                          {a.name}
                        </span>
                        {active && (
                          <span className="text-emerald-600 text-xs font-medium">
                            Added
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Field>

            <Field label="Due Date">
              <div className="relative">
                <input
                  type="date"
                  className={inputCls}
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
                <MdCalendarToday className={iconRightCls} />
              </div>
            </Field>
          </div>

          {/* footer buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit?.(form)}
              className={`inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium text-white
                ${
                  canSubmit
                    ? "bg-[#0d3b2e] hover:opacity-95"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {isEdit ? "Save changes" : "Add course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
