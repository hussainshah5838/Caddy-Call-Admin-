import React from "react";
import { useNavigate } from "react-router-dom";
import CourseUpsertForm from "../Components/courses/forms/CourseUpsertForm";
import useCourses from "../hooks/useCourses";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toAvatar(name = "Admin", id = "") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E5E7EB&color=111827&size=64&rounded=true&seed=${encodeURIComponent(id)}`;
}

export default function CoursesAdd() {
  const nav = useNavigate();
  const { user } = useAuth();
  const C = useCourses();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const [adminOptions, setAdminOptions] = React.useState([]);
  const [idByAvatar, setIdByAvatar] = React.useState({});
  const [loadingAdmins, setLoadingAdmins] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    const fetchAdmins = async () => {
      if (isCourseAdmin) {
        if (mounted) {
          setAdminOptions([
            { id: "ca-1", name: "Course Admin", avatar: toAvatar("Course Admin", "ca-1") },
            { id: "k-1", name: "Kitchen Staff", avatar: toAvatar("Kitchen Staff", "k-1") },
            { id: "b-1", name: "Beverage Cart Staff", avatar: toAvatar("Beverage Cart Staff", "b-1") },
          ]);
          setIdByAvatar({});
          setLoadingAdmins(false);
        }
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (mounted) {
          setError("Authentication token not found.");
          setLoadingAdmins(false);
        }
        return;
      }

      setLoadingAdmins(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/courses/available-admins`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.admins)) {
          throw new Error(data?.message || "Failed to fetch admin options.");
        }

        const options = data.admins.map((admin) => {
          const adminId = String(admin?._id || "");
          return {
            id: adminId,
            name: admin?.name || "Admin",
            avatar: toAvatar(admin?.name || "Admin", adminId),
          };
        });
        const lookup = {};
        options.forEach((opt) => {
          lookup[opt.avatar] = opt.id;
        });

        if (mounted) {
          setAdminOptions(options);
          setIdByAvatar(lookup);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to fetch admin options.");
          setAdminOptions([]);
          setIdByAvatar({});
        }
      } finally {
        if (mounted) setLoadingAdmins(false);
      }
    };

    fetchAdmins();

    return () => {
      mounted = false;
    };
  }, [isCourseAdmin]);

  if (isCourseAdmin) {
    return (
      <div>
        <CourseUpsertForm
          mode="create"
          adminOptions={adminOptions}
          onCancel={() => nav("/courses")}
          onSubmit={(payload) => {
            C.create({
              name: payload?.name || "New Course",
              location: payload?.location || "",
              status:
                String(payload?.status || "").toLowerCase() === "maintenance"
                  ? "maintenance"
                  : "active",
              hours:
                payload?.hoursFrom && payload?.hoursTo
                  ? `${payload.hoursFrom} - ${payload.hoursTo}`
                  : payload?.hours || "-",
              admins: payload?.admins || [],
              mapUrl: payload?.map || "#",
              photo: typeof payload?.photo === "string" ? payload.photo : "",
              dueDate: payload?.dueDate || "",
              taxRate: payload?.taxRate ?? "",
              deliveryFee: payload?.deliveryFee ?? "",
              holes: payload?.holes || [],
              order: C.rows.length + 1,
            });
            nav("/courses");
          }}
        />
      </div>
    );
  }

  const handleSubmit = React.useCallback(
    async (payload) => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      if (!payload?.mapCoordinates || !payload?.location) {
        setError("Please select location from map before adding course.");
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
            throw new Error(uploadData?.message || "Failed to upload course photo.");
          }
          photoUrl = uploadData.imageUrl;
        }

        const selectedAdminIds = (payload?.admins || [])
          .map((avatar) => idByAvatar[avatar])
          .filter(Boolean);

        const coords = [payload.mapCoordinates.lng, payload.mapCoordinates.lat];
        const requestBody = {
          courseName: payload?.name || "",
          status: String(payload?.status || "").toLowerCase() === "maintenance" ? "Maintenance" : "Active",
          location: {
            type: "Point",
            address: payload?.location || "",
            coordinates: coords,
          },
          hours: {
            open: payload?.hoursFrom || "",
            close: payload?.hoursTo || "",
          },
          map: {
            type: "Point",
            address: payload?.location || "",
            coordinates: coords,
          },
          photo: photoUrl,
          assignedAdmins: selectedAdminIds,
          dueDate: payload?.dueDate || null,
          taxRate: payload?.taxRate === "" ? "" : payload?.taxRate,
          deliveryFee: payload?.deliveryFee === "" ? "" : payload?.deliveryFee,
          holes: payload?.holes || [],
        };

        const createRes = await fetch(`${API_BASE_URL}/courses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
        const createData = await createRes.json().catch(() => ({}));
        if (!createRes.ok || !createData?.success) {
          throw new Error(createData?.message || "Failed to create course.");
        }

        nav("/courses");
      } catch (err) {
        setError(err?.message || "Failed to create course.");
      } finally {
        setSaving(false);
      }
    },
    [idByAvatar, nav]
  );

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <CourseUpsertForm
        mode="create"
        adminOptions={adminOptions}
        onCancel={() => nav("/courses")}
        onSubmit={handleSubmit}
      />
      {(loadingAdmins || saving) && (
        <p className="mt-3 text-sm text-gray-500">
          {saving ? "Creating course..." : "Loading admins..."}
        </p>
      )}
    </div>
  );
}
