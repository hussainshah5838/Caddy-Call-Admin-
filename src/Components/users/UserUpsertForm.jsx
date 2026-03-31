import React, { useEffect, useState, useMemo } from "react";
import {
  MdKeyboardArrowDown,
  MdClose,
  MdAddAPhoto,
} from "react-icons/md";

const STAFF_ROLES = ["Kitchen", "Beverage Cart", "Bar", "Runner"];
const SINGLE_ROLES = ["Course Admin", "Golfer"];

const input =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600";
const select =
  "w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export default function UserUpsertForm({
  mode = "create",
  value,
  courseOptions = [],
  submitting = false,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    photo: null,
    email: "",
    phoneNo: "",
    course: "",
    roles: ["Course Admin"],
    status: "active",
  });
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInputRef = React.useRef(null);

  useEffect(() => {
    if (value) {
      const nextRoles = Array.isArray(value?.roles) && value.roles.length > 0
        ? value.roles
        : value?.role
        ? [value.role]
        : [];
      setForm((f) => ({ ...f, ...value, roles: nextRoles }));
      if (typeof value?.photo === "string") setPhotoUrl(value.photo);
    }
  }, [value]);

  const selectedRoles = Array.isArray(form.roles) ? form.roles : [];
  const normalizedStaffRoles = selectedRoles.filter((role) => STAFF_ROLES.includes(role));
  const userType = selectedRoles.some((r) => SINGLE_ROLES.includes(r))
    ? selectedRoles[0]
    : "Staff";
  const isGolfer = String(userType).toLowerCase() === "golfer";
  const canSubmit = useMemo(
    () =>
      !!form.email &&
      (userType === "Staff" ? normalizedStaffRoles.length > 0 : selectedRoles.length > 0) &&
      (isGolfer || !!form.course),
    [form.email, form.course, isGolfer, selectedRoles.length, normalizedStaffRoles.length, userType]
  );

  const setUserType = (nextType) => {
    if (nextType === "Staff") {
      setForm((f) => ({
        ...f,
        roles: f.roles.filter((r) => STAFF_ROLES.includes(r)),
      }));
      return;
    }
    setForm((f) => ({
      ...f,
      roles: [nextType],
      course: nextType === "Golfer" ? "" : f.course,
    }));
  };

  const toggleStaffRole = (role) => {
    setForm((f) => {
      const existing = Array.isArray(f.roles) ? f.roles : [];
      const next = existing.includes(role)
        ? existing.filter((r) => r !== role)
        : [...existing, role];
      return { ...f, roles: next };
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">
        {mode === "edit" ? "Edit User" : "Add Users"}
      </h1>

      {/* Photo */}
      <div className="md:col-span-3">
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="relative w-28 h-28 cursor-pointer rounded-full border-2 border-[#0d3b2e] grid place-items-center overflow-hidden"
          title="Upload photo"
        >
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
        </button>
        <label className="inline-flex mt-3 text-sm font-medium text-[#0d3b2e] cursor-pointer">
          <input
            ref={photoInputRef}
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
              Phone No
            </label>
            <input
              className={input}
              placeholder="e.g. +92 300 1234567"
              value={form.phoneNo}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNo: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Role</label>
            <div className="space-y-2">
              <div className="relative">
                <select
                  className={select}
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option>Staff</option>
                  <option>Course Admin</option>
                  <option>Golfer</option>
                </select>
                <MdKeyboardArrowDown className="absolute right-2.5 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {userType === "Staff" && (
                <div className="rounded-md border border-gray-200 bg-white px-3 py-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STAFF_ROLES.map((role) => (
                      <label key={role} className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => toggleStaffRole(role)}
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isGolfer && (
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
          )}

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

          <div className="md:col-span-2 mt-2 flex items-center gap-4">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-200 px-6 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit || submitting}
              onClick={() =>
                !submitting &&
                canSubmit &&
                onSubmit?.({
                  ...form,
                  roles: userType === "Staff" ? normalizedStaffRoles : selectedRoles,
                  role:
                    userType === "Staff"
                      ? normalizedStaffRoles[0] || ""
                      : selectedRoles[0] || "",
                })
              }
              className={`rounded-md px-6 py-2.5 text-sm text-white ${
                canSubmit && !submitting
                  ? "bg-[#0d3b2e] hover:opacity-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {mode === "edit"
                ? submitting
                  ? "Saving..."
                  : "Save changes"
                : submitting
                ? "Adding..."
                : "Add User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
