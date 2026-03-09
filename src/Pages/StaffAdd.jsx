import React from "react";
import { useNavigate } from "react-router-dom";
import CourseAdminStaffUpsertForm from "../Components/users/CourseAdminStaffUpsertForm";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toBackendRole(role = "") {
  const normalized = String(role).trim().toLowerCase();
  if (normalized === "kitchen") return "kitchen";
  if (normalized === "beverage cart") return "beverage cart";
  if (normalized === "bar") return "bar";
  if (normalized === "pro shop") return "pro shop";
  if (normalized === "runner") return "runner";
  return "kitchen";
}

function toBackendStatus(status = "") {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "inactive") return "Inactive";
  if (normalized === "pending") return "Pending";
  return "Active";
}

export default function StaffAdd() {
  const nav = useNavigate();
  const listPath = "/course-admin/staff";
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

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

            nav(listPath);
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
