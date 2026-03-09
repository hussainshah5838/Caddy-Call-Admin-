import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import UserUpsertForm from "../Components/users/UserUpsertForm";
import CourseAdminStaffUpsertForm from "../Components/users/CourseAdminStaffUpsertForm";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toFormRole(role = "") {
  const normalized = String(role).trim().toLowerCase();
  if (normalized === "course admin") return "Course Admin";
  if (normalized === "golfer") return "Golfer";
  if (normalized === "kitchen staff" || normalized === "kitchen") return "Kitchen";
  if (normalized === "beverage cart staff" || normalized === "beverage cart") return "Beverage Cart";
  if (normalized === "bar staff" || normalized === "bar") return "Bar";
  if (normalized === "pro shop staff" || normalized === "pro shop") return "Pro Shop";
  if (normalized === "runner") return "Runner";
  return "Course Admin";
}

function toBackendRole(role = "") {
  const normalized = String(role).trim().toLowerCase();
  if (normalized === "course admin") return "course admin";
  if (normalized === "golfer") return "golfer";
  if (normalized === "kitchen") return "kitchen";
  if (normalized === "beverage cart") return "beverage cart";
  if (normalized === "bar") return "bar";
  if (normalized === "pro shop") return "pro shop";
  if (normalized === "runner") return "runner";
  return "course admin";
}

function toBackendStatus(status = "") {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "inactive") return "Inactive";
  if (normalized === "pending") return "Pending";
  return "Active";
}

export default function UsersEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const listPath = isCourseAdmin ? "/course-admin/staff" : "/users";
  const requestParams = React.useMemo(
    () =>
      isCourseAdmin
        ? {
            role: "Staff",
            course: user?.course || "",
          }
        : {},
    [isCourseAdmin, user?.course]
  );
  const U = useUsers({ remote: true, requestParams });
  const nav = useNavigate();
  const existing = U.getById(id);
  const [courseOptions, setCourseOptions] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      if (isCourseAdmin) {
        if (mounted) {
          setCourseOptions(U.courses.filter((c) => c !== "all"));
        }
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (mounted) setCourseOptions([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.courses)) {
          if (mounted) setCourseOptions([]);
          return;
        }

        const names = data.courses
          .map((c) => c?.courseName)
          .filter(Boolean);
        if (mounted) setCourseOptions(Array.from(new Set(names)));
      } catch {
        if (mounted) setCourseOptions([]);
      }
    };

    fetchCourses();

    return () => {
      mounted = false;
    };
  }, [isCourseAdmin, U.courses]);

  if (U.loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (!existing) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">User not found.</p>
        <button
          onClick={() => nav(listPath)}
          className="mt-3 rounded-md border px-3 py-1.5 text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {isCourseAdmin ? (
        <CourseAdminStaffUpsertForm
          mode="edit"
          submitting={saving}
          value={{
            photo: existing.avatar,
            email: existing.email,
            phoneNo: existing.phoneNo || "",
            role: toFormRole(existing.roles[0] || "Kitchen"),
            status: existing.status,
          }}
          onCancel={() => nav(listPath)}
          onSubmit={async (payload) => {
            if (saving) return;
            const token = localStorage.getItem("auth:token");
            if (!token) {
              setError("Authentication token not found.");
              return;
            }

            setSaving(true);
            setError("");
            try {
              let photoUrl;
              if (payload?.photo instanceof File) {
                const fd = new FormData();
                fd.append("image", payload.photo);
                const uploadRes = await fetch(`${API_BASE_URL}/upload/image`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: fd,
                });
                const uploadData = await uploadRes.json().catch(() => ({}));
                if (!uploadRes.ok || !uploadData?.success || !uploadData?.imageUrl) {
                  throw new Error(uploadData?.message || "Failed to upload user photo.");
                }
                photoUrl = uploadData.imageUrl;
              } else if (payload?.photo === null) {
                photoUrl = "";
              }

              const updateBody = {
                phoneNo: payload?.phoneNo || "",
                status: toBackendStatus(payload?.status),
              };

              if (photoUrl !== undefined) {
                updateBody.photo = photoUrl;
              }

              const response = await fetch(`${API_BASE_URL}/users/${existing.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateBody),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to update user.");
              }

              await U.refresh();
              nav(listPath);
            } catch (err) {
              setError(err?.message || "Failed to update user.");
            } finally {
              setSaving(false);
            }
          }}
        />
      ) : (
        <UserUpsertForm
        mode="edit"
        submitting={saving}
        value={{
          photo: existing.avatar,
          email: existing.email,
          phoneNo: existing.phoneNo || "",
          course: existing.course,
          role: toFormRole(existing.roles[0] || "Course Admin"),
          status: existing.status,
        }}
        courseOptions={courseOptions}
        onCancel={() => nav(listPath)}
        onSubmit={async (payload) => {
          if (saving) return;
          const token = localStorage.getItem("auth:token");
          if (!token) {
            setError("Authentication token not found.");
            return;
          }

          setSaving(true);
          setError("");
          try {
            let photoUrl;
            if (payload?.photo instanceof File) {
              const fd = new FormData();
              fd.append("image", payload.photo);
              const uploadRes = await fetch(`${API_BASE_URL}/upload/image`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: fd,
              });
              const uploadData = await uploadRes.json().catch(() => ({}));
              if (!uploadRes.ok || !uploadData?.success || !uploadData?.imageUrl) {
                throw new Error(uploadData?.message || "Failed to upload user photo.");
              }
              photoUrl = uploadData.imageUrl;
            } else if (payload?.photo === null) {
              photoUrl = "";
            }

            const updateBody = {
              email: payload?.email || "",
              phoneNo: payload?.phoneNo || "",
              role: toBackendRole(payload?.role),
              status: toBackendStatus(payload?.status),
            };

            if (String(payload?.role || "").toLowerCase() !== "golfer") {
              updateBody.course = payload?.course || "";
            }
            if (photoUrl !== undefined) {
              updateBody.photo = photoUrl;
            }

            const response = await fetch(`${API_BASE_URL}/users/${existing.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updateBody),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data?.success) {
              throw new Error(data?.message || "Failed to update user.");
            }

            await U.refresh();
            nav(listPath);
          } catch (err) {
            setError(err?.message || "Failed to update user.");
          } finally {
            setSaving(false);
          }
        }}
      />
      )}
    </>
  );
}
