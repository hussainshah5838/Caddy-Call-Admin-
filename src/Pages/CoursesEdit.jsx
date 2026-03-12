import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseUpsertForm from "../Components/courses/forms/CourseUpsertForm";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toAvatar(name = "Admin", id = "") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E5E7EB&color=111827&size=64&rounded=true&seed=${encodeURIComponent(id)}`;
}

function normalizeStatus(status = "") {
  return String(status).toLowerCase() === "maintenance" ? "maintenance" : "active";
}

export default function CoursesEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [courseRaw, setCourseRaw] = React.useState(null);
  const [formValue, setFormValue] = React.useState(null);
  const [adminOptions, setAdminOptions] = React.useState([]);
  const [idByAvatar, setIdByAvatar] = React.useState({});

  React.useEffect(() => {
    let mounted = true;

    const fetchEditData = async () => {
      if (isCourseAdmin) {
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
            setAdminOptions([]);
            setIdByAvatar({});
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
              holes: course?.holes || [],
              admins: [],
              photo: course?.photo || null,
            });
          }
        } catch (err) {
          if (mounted) setError(err?.message || "Failed to fetch course details.");
        } finally {
          if (mounted) setLoading(false);
        }
        return;
      }

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
        const [courseRes, adminsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/courses/${id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/courses/available-admins`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const courseData = await courseRes.json().catch(() => ({}));
        const adminsData = await adminsRes.json().catch(() => ({}));

        if (!courseRes.ok || !courseData?.success || !courseData?.course) {
          throw new Error(courseData?.message || "Failed to fetch course details.");
        }

        const course = courseData.course;
        const assignedAdmins = Array.isArray(course.assignedAdmins)
          ? course.assignedAdmins
          : [];
        const availableAdmins = Array.isArray(adminsData?.admins)
          ? adminsData.admins
          : [];

        const mergedAdminsMap = new Map();
        [...assignedAdmins, ...availableAdmins].forEach((admin) => {
          const adminId = String(admin?._id || "");
          if (!adminId || mergedAdminsMap.has(adminId)) return;
          mergedAdminsMap.set(adminId, {
            id: adminId,
            name: admin?.name || "Admin",
            avatar: toAvatar(admin?.name || "Admin", adminId),
          });
        });

        const options = Array.from(mergedAdminsMap.values());
        const avatarLookup = {};
        const selectedAdminAvatars = [];

        options.forEach((opt) => {
          avatarLookup[opt.avatar] = opt.id;
        });
        assignedAdmins.forEach((admin) => {
          const adminId = String(admin?._id || "");
          const matched = options.find((opt) => opt.id === adminId);
          if (matched) selectedAdminAvatars.push(matched.avatar);
        });

        const hoursFrom = course?.hours?.open || "";
        const hoursTo = course?.hours?.close || "";
        const mapCoordinates = Array.isArray(course?.map?.coordinates) &&
          course.map.coordinates.length === 2
          ? {
              lat: Number(course.map.coordinates[1]),
              lng: Number(course.map.coordinates[0]),
            }
          : null;
        const locationCoordinates = Array.isArray(course?.location?.coordinates) &&
          course.location.coordinates.length === 2
          ? course.location.coordinates
          : [];
        const mapCoordsForUrl = mapCoordinates
          ? [mapCoordinates.lng, mapCoordinates.lat]
          : locationCoordinates;
        const mapUrl = Array.isArray(mapCoordsForUrl) && mapCoordsForUrl.length === 2
          ? `https://www.google.com/maps?q=${mapCoordsForUrl[1]},${mapCoordsForUrl[0]}`
          : "";

        const nextFormValue = {
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
          holes: course?.holes || [],
          admins: selectedAdminAvatars,
          photo: course?.photo || null,
        };

        if (mounted) {
          setCourseRaw(course);
          setAdminOptions(options);
          setIdByAvatar(avatarLookup);
          setFormValue(nextFormValue);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to fetch course details.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEditData();

    return () => {
      mounted = false;
    };
  }, [id, isCourseAdmin]);

  const handleSubmit = React.useCallback(
    async (payload) => {
      if (isCourseAdmin) {
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
            holes: payload?.holes || [],
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

          nav("/courses");
        } catch (err) {
          setError(err?.message || "Failed to update course.");
        } finally {
          setSaving(false);
        }
        return;
      }

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

        const selectedAdminIds = (payload?.admins || [])
          .map((avatar) => idByAvatar[avatar])
          .filter(Boolean);

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
          status: normalizeStatus(payload?.status) === "maintenance" ? "Maintenance" : "Active",
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
          assignedAdmins: selectedAdminIds,
          dueDate: payload?.dueDate || null,
          taxRate: payload?.taxRate === "" ? "" : payload?.taxRate,
          deliveryFee: payload?.deliveryFee === "" ? "" : payload?.deliveryFee,
          holes: payload?.holes || [],
        };

        if (photoUrl) {
          requestBody.photo = photoUrl;
        }

        if (typeof payload?.photo === "string") {
          requestBody.photo = payload.photo;
        }

        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
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

        nav("/courses");
      } catch (err) {
        setError(err?.message || "Failed to update course.");
      } finally {
        setSaving(false);
      }
    },
    [courseRaw, id, idByAvatar, isCourseAdmin, nav]
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
        <button onClick={() => nav("/courses")} className="mt-3 rounded-md border px-3 py-1.5 text-sm">
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
        adminOptions={adminOptions}
        showAssignedAdmins={!isCourseAdmin}
        onCancel={() => nav("/courses")}
        onSubmit={handleSubmit}
      />
      {saving && (
        <p className="mt-3 text-sm text-gray-500">Saving changes...</p>
      )}
    </div>
  );
}
