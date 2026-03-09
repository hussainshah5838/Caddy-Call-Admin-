import React from "react";
import { useNavigate } from "react-router-dom";
import CourseUpsertForm from "../Components/courses/forms/CourseUpsertForm";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function normalizeStatus(status = "") {
  return String(status).toLowerCase() === "maintenance" ? "maintenance" : "active";
}

export default function CourseAdminCoursesEdit() {
  const nav = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [courseRaw, setCourseRaw] = React.useState(null);
  const [formValue, setFormValue] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const fetchEditData = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (mounted) {
          setError("Authentication token not found.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/courses/my-course`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.course) {
          throw new Error(data?.message || "Failed to fetch course details.");
        }

        const course = data.course;
        const hoursFrom = course?.hours?.open || "";
        const hoursTo = course?.hours?.close || "";
        const mapCoordinates =
          Array.isArray(course?.map?.coordinates) &&
          course.map.coordinates.length === 2
            ? {
                lat: Number(course.map.coordinates[1]),
                lng: Number(course.map.coordinates[0]),
              }
            : null;
        const locationCoordinates =
          Array.isArray(course?.location?.coordinates) &&
          course.location.coordinates.length === 2
            ? course.location.coordinates
            : [];
        const mapCoordsForUrl = mapCoordinates
          ? [mapCoordinates.lng, mapCoordinates.lat]
          : locationCoordinates;
        const mapUrl =
          Array.isArray(mapCoordsForUrl) && mapCoordsForUrl.length === 2
            ? `https://www.google.com/maps?q=${mapCoordsForUrl[1]},${mapCoordsForUrl[0]}`
            : "";

        if (mounted) {
          setCourseRaw(course);
          setFormValue({
            id: String(course?._id || ""),
            name: course?.courseName || "",
            location: course?.location?.address || "",
            status: normalizeStatus(course?.status),
            hoursFrom,
            hoursTo,
            hours: [hoursFrom, hoursTo].filter(Boolean).join(" to "),
            map: mapUrl,
            mapCoordinates,
            dueDate: course?.dueDate
              ? new Date(course.dueDate).toISOString().slice(0, 10)
              : "",
            taxRate: course?.taxRate ?? "",
            deliveryFee: course?.deliveryFee ?? "",
            admins: [],
            photo: course?.photo || null,
          });
        }
      } catch (err) {
        if (mounted) setError(err?.message || "Failed to fetch course details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEditData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = React.useCallback(
    async (payload) => {
      const token = localStorage.getItem("auth:token");
      if (!token || !courseRaw) return;

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

        const fallbackLocationCoords =
          Array.isArray(courseRaw?.location?.coordinates) &&
          courseRaw.location.coordinates.length === 2
            ? courseRaw.location.coordinates
            : [0, 0];
        const selectedCoords = payload?.mapCoordinates
          ? [payload.mapCoordinates.lng, payload.mapCoordinates.lat]
          : fallbackLocationCoords;

        const requestBody = {
          courseName: payload?.name || "",
          status:
            normalizeStatus(payload?.status) === "maintenance"
              ? "Maintenance"
              : "Active",
          location: {
            type: "Point",
            address: payload?.location || courseRaw?.location?.address || "",
            coordinates: selectedCoords,
          },
          hours: {
            open: payload?.hoursFrom || "",
            close: payload?.hoursTo || "",
          },
          map: {
            type: "Point",
            address: payload?.location || courseRaw?.map?.address || "",
            coordinates: selectedCoords,
          },
          dueDate: payload?.dueDate || null,
          taxRate: payload?.taxRate === "" ? "" : payload?.taxRate,
          deliveryFee: payload?.deliveryFee === "" ? "" : payload?.deliveryFee,
        };

        if (photoUrl) {
          requestBody.photo = photoUrl;
        }
        if (typeof payload?.photo === "string") {
          requestBody.photo = payload.photo;
        }

        const response = await fetch(`${API_BASE_URL}/courses/my-course`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to update course.");
        }

        nav("/course-admin/courses");
      } catch (err) {
        setError(err?.message || "Failed to update course.");
      } finally {
        setSaving(false);
      }
    },
    [courseRaw, nav]
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading course details...</p>
      </div>
    );
  }

  if (!formValue) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">{error || "Course not found."}</p>
        <button
          onClick={() => nav("/course-admin/courses")}
          className="mt-3 rounded-md border px-3 py-1.5 text-sm"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <CourseUpsertForm
        mode="edit"
        value={formValue}
        adminOptions={[]}
        showAssignedAdmins={false}
        onCancel={() => nav("/course-admin/courses")}
        onSubmit={handleSubmit}
      />
      {saving && (
        <p className="mt-3 text-sm text-gray-500">Saving changes...</p>
      )}
    </div>
  );
}
