import { useMemo, useState, useCallback, useEffect } from "react";
import { coursesSeed } from "../Data/coursesSeed";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toAvatar(name = "User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E5E7EB&color=111827&size=64`;
}

function toMapUrl(course) {
  const coords = course?.map?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    return `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;
  }
  const address = course?.map?.address || course?.location?.address || "";
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
  }
  return "#";
}

function mapCourseRow(course, index) {
  const open = course?.hours?.open || "";
  const close = course?.hours?.close || "";
  const assignedAdmins = Array.isArray(course?.assignedAdmins)
    ? course.assignedAdmins
    : [];

  return {
    id: String(course?._id || ""),
    name: course?.courseName || "",
    photo: course?.photo || "",
    location: course?.location?.address || "",
    status: String(course?.status || "").toLowerCase() === "maintenance" ? "maintenance" : "active",
    hours: open && close ? `${open} - ${close}` : open || close || "-",
    admins: assignedAdmins.map((a) => toAvatar(a?.name || "Admin")),
    adminIds: assignedAdmins.map((a) => String(a?._id || "")).filter(Boolean),
    mapUrl: toMapUrl(course),
    dueDate: course?.dueDate ? new Date(course.dueDate).toISOString().slice(0, 10) : "",
    taxRate: course?.taxRate ?? "",
    deliveryFee: course?.deliveryFee ?? "",
    holes: Array.isArray(course?.holes) ? course.holes : [],
    order: index + 1,
  };
}

export default function useCourses(options = {}) {
  const { remote = false } = options;
  const [rows, setRows] = useState(remote ? [] : coursesSeed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ by: "order", dir: "asc" });
  const [loading, setLoading] = useState(remote);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async () => {
    if (!remote) return;

    const token = localStorage.getItem("auth:token");
    if (!token) {
      setRows([]);
      setLoading(false);
      setError("Authentication token not found.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success || !Array.isArray(data?.courses)) {
        throw new Error(data?.message || "Failed to fetch courses.");
      }

      setRows(data.courses.map((course, index) => mapCourseRow(course, index)));
    } catch (err) {
      setError(err?.message || "Failed to fetch courses.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [remote]);

  const create = useCallback((course) => {
    setRows((r) => [{ ...course, id: crypto.randomUUID() }, ...r]);
  }, []);

  const update = useCallback((id, patch) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const remove = useCallback((id) => {
    if (!remote) {
      setRows((r) => r.filter((x) => x.id !== id));
      return;
    }

    const token = localStorage.getItem("auth:token");
    if (!token) return;

    fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json().catch(() => ({})).then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data?.success) return;
        setRows((r) => r.filter((x) => x.id !== id));
      })
      .catch(() => {});
  }, [remote]);

  const getById = useCallback(
    (id) => rows.find((r) => r.id === id) || null,
    [rows]
  );

  const toggleStatus = useCallback((id) => {
    if (!remote) {
      setRows((r) =>
        r.map((x) =>
          x.id === id
            ? { ...x, status: x.status === "active" ? "maintenance" : "active" }
            : x
        )
      );
      return;
    }

    const token = localStorage.getItem("auth:token");
    if (!token) return;

    fetch(`${API_BASE_URL}/courses/${id}/toggle-status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json().catch(() => ({})).then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data?.success || !data?.course) return;
        setRows((r) =>
          r.map((x, index) =>
            x.id === id ? mapCourseRow(data.course, index) : x
          )
        );
      })
      .catch(() => {});
  }, [remote]);

  const filtered = useMemo(() => {
    let list = rows;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }
    if (status !== "all") list = list.filter((c) => c.status === status);

    list = [...list].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.by === "name") return a.name.localeCompare(b.name) * dir;
      if (sort.by === "order") return (a.order - b.order) * dir;
      return 0;
    });

    return list;
  }, [rows, query, status, sort]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    rows,
    filtered,
    loading,
    error,
    refresh: fetchCourses,
    query,
    setQuery,
    status,
    setStatus,
    sort,
    setSort,
    create,
    update,
    remove,
    toggleStatus,
    getById,
  };
}
