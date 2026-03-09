import { useMemo, useState, useCallback, useEffect } from "react";
import { usersSeed } from "../Data/usersSeed";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toAvatar(name = "User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E5E7EB&color=111827&size=64`;
}

function toDisplayRole(role = "") {
  const normalized = String(role).trim().toLowerCase();
  if (normalized === "course admin") return "Course Admin";
  if (normalized === "admin") return "Admin";
  if (normalized === "golfer") return "Golfer";
  if (normalized === "beverage cart") return "Beverage Cart Staff";
  if (normalized === "pro shop") return "Pro Shop Staff";
  if (normalized === "kitchen") return "Kitchen Staff";
  if (normalized === "runner") return "Runner";
  if (normalized === "bar") return "Bar Staff";
  return role;
}

function toKind(role = "") {
  const normalized = String(role).trim().toLowerCase();
  if (normalized === "golfer") return "golfer";
  if (["admin", "course admin", "superadmin"].includes(normalized)) return "admin";
  return "staff";
}

function toStatus(status = "") {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "inactive") return "inactive";
  if (normalized === "pending") return "pending";
  return "active";
}

function toBackendStatus(status = "") {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "inactive") return "Inactive";
  if (normalized === "pending") return "Pending";
  return "Active";
}

function toDateLabel(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().slice(0, 10);
}

function mapUserRow(user) {
  return {
    id: String(user?._id || ""),
    name: user?.name || "",
    email: user?.email || "",
    phoneNo: user?.phoneNo || "",
    avatar: user?.photo || toAvatar(user?.name || "User"),
    roles: [toDisplayRole(user?.role || "")],
    course: user?.course?.courseName || "",
    status: toStatus(user?.status || ""),
    lastActivity: toDateLabel(user?.lastActivity || user?.createdAt),
    kind: toKind(user?.role || ""),
  };
}

export default function useUsers(options = {}) {
  const { remote = false, requestParams = {} } = options;
  const [rows, setRows] = useState(remote ? [] : usersSeed);
  const [remoteCourses, setRemoteCourses] = useState([]);
  const [tab, setTab] = useState("all"); // all | golfer | staff | admin
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(remote);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!remote) return;

    const token = localStorage.getItem("auth:token");
    if (!token) {
      setRows([]);
      setRemoteCourses([]);
      setLoading(false);
      setError("Authentication token not found.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      Object.entries(requestParams || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        query.set(key, String(value));
      });
      const usersUrl = query.toString()
        ? `${API_BASE_URL}/users?${query.toString()}`
        : `${API_BASE_URL}/users`;

      const response = await fetch(usersUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success || !Array.isArray(data?.users)) {
        throw new Error(data?.message || "Failed to fetch users.");
      }

      setRows(data.users.map((user) => mapUserRow(user)));

      // Fetch all courses for course-filter dropdown options.
      // Keep users list usable even if this secondary request fails.
      try {
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const coursesData = await coursesResponse.json().catch(() => ({}));
        if (coursesResponse.ok && coursesData?.success && Array.isArray(coursesData?.courses)) {
          const names = coursesData.courses
            .map((c) => c?.courseName)
            .filter(Boolean);
          const unique = Array.from(new Set(names));
          setRemoteCourses(unique);
        } else {
          setRemoteCourses([]);
        }
      } catch {
        setRemoteCourses([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch users.");
      setRows([]);
      setRemoteCourses([]);
    } finally {
      setLoading(false);
    }
  }, [remote, requestParams]);

  const create = useCallback((u) => {
    setRows((r) => [{ ...u, id: crypto.randomUUID() }, ...r]);
  }, []);
  const update = useCallback((id, patch) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const remove = useCallback(
    (id) => {
      if (!remote) {
        setRows((r) => r.filter((x) => x.id !== id));
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) return;

      fetch(`${API_BASE_URL}/users/${id}`, {
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
    },
    [remote]
  );
  const toggleStatus = useCallback(
    async (id, currentStatus) => {
      const nextStatus = String(currentStatus).toLowerCase() === "active" ? "inactive" : "active";

      if (!remote) {
        setRows((r) => r.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)));
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: toBackendStatus(nextStatus) }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to update user status.");
        }
        setRows((r) => r.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)));
      } catch (err) {
        setError(err?.message || "Failed to update user status.");
      }
    },
    [remote]
  );
  const getById = useCallback(
    (id) => rows.find((x) => x.id === id) || null,
    [rows]
  );

  const courses = useMemo(() => {
    if (remote && remoteCourses.length > 0) {
      return ["all", ...remoteCourses];
    }
    const set = new Set(rows.map((r) => r.course).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [remote, remoteCourses, rows]);

  const counts = useMemo(() => {
    const all = rows.length;
    return {
      all,
      golfer: rows.filter((r) => r.kind === "golfer").length,
      staff: rows.filter((r) => r.kind === "staff").length,
      admin: rows.filter((r) => r.kind === "admin").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (tab !== "all") out = out.filter((r) => r.kind === tab);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    if (course !== "all") out = out.filter((r) => r.course === course);
    if (status !== "all") out = out.filter((r) => r.status === status);
    return out;
  }, [rows, tab, query, course, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    rows,
    filtered,
    loading,
    error,
    refresh: fetchUsers,
    tab,
    setTab,
    query,
    setQuery,
    course,
    setCourse,
    status,
    setStatus,
    counts,
    courses,
    create,
    update,
    toggleStatus,
    remove,
    getById,
  };
}
