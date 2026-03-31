import React from "react";
import { useNavigate } from "react-router-dom";
import UserUpsertForm from "../Components/users/UserUpsertForm";
import CourseAdminStaffUpsertForm from "../Components/users/CourseAdminStaffUpsertForm";
import useUsers from "../hooks/useUsers";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

function toBackendRoles(roles = [], fallbackRole = "") {
  const source = Array.isArray(roles) && roles.length > 0 ? roles : [fallbackRole];
  return source.map((r) => toBackendRole(r)).filter(Boolean);
}

function toBackendStatus(status = "") {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "inactive") return "Inactive";
  if (normalized === "pending") return "Pending";
  return "Active";
}

export default function UsersAdd() {
  const nav = useNavigate();
  const { user } = useAuth();
  const localUsers = useUsers();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const listPath = isCourseAdmin ? "/course-admin/staff" : "/users";
  const [courseOptions, setCourseOptions] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [credentialsModalOpen, setCredentialsModalOpen] = React.useState(false);
  const [createdCredentials, setCreatedCredentials] = React.useState({
    email: "",
    password: "",
  });
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      if (isCourseAdmin) {
        if (mounted) {
          setCourseOptions(localUsers.courses.filter((c) => c !== "all"));
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
  }, [isCourseAdmin, localUsers.courses]);

  if (isCourseAdmin) {
    return (
      <>
        {error && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        <CourseAdminStaffUpsertForm
          mode="create"
          submitting={saving}
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
              let photoUrl = "";
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
              }

              const requestBody = {
                name: String(payload?.email || "").split("@")[0] || "user",
                email: payload?.email || "",
                phoneNo: payload?.phoneNo || "",
                role: toBackendRole(payload?.role),
                roles: toBackendRoles(payload?.roles, payload?.role),
                status: toBackendStatus(payload?.status),
                photo: photoUrl,
              };

              const response = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to create user.");
              }

              setCreatedCredentials({
                email: data?.user?.email || payload?.email || "",
                password: data?.password || "",
              });
              setCredentialsModalOpen(true);
            } catch (err) {
              setError(err?.message || "Failed to create user.");
            } finally {
              setSaving(false);
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <UserUpsertForm
        mode="create"
        courseOptions={courseOptions}
        submitting={saving}
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
            let photoUrl = "";
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
            }

            const requestBody = {
              name: String(payload?.email || "").split("@")[0] || "user",
              email: payload?.email || "",
              phoneNo: payload?.phoneNo || "",
              role: toBackendRole(payload?.role),
              roles: toBackendRoles(payload?.roles, payload?.role),
              status: toBackendStatus(payload?.status),
              photo: photoUrl,
            };

            if (String(payload?.role || "").toLowerCase() !== "golfer") {
              requestBody.course = payload?.course || "";
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data?.success) {
              throw new Error(data?.message || "Failed to create user.");
            }

            setCreatedCredentials({
              email: data?.user?.email || payload?.email || "",
              password: data?.password || "",
            });
            setCredentialsModalOpen(true);
          } catch (err) {
            setError(err?.message || "Failed to create user.");
          } finally {
            setSaving(false);
          }
        }}
      />

      {credentialsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Login Credentials</h3>
            <p className="mt-1 text-sm text-gray-600">
              Copy and share these credentials with the user.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                  {createdCredentials.email || "-"}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Password</p>
                <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                  {createdCredentials.password || "-"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `Email: ${createdCredentials.email || ""}\nPassword: ${
                      createdCredentials.password || ""
                    }`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                className="rounded-md bg-[#0d3b2e] px-3 py-1.5 text-sm text-white"
                onClick={() => {
                  setCredentialsModalOpen(false);
                  setCreatedCredentials({ email: "", password: "" });
                  setCopied(false);
                  nav(listPath);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
