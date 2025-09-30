import { useMemo, useState, useCallback } from "react";
import { usersSeed } from "../Data/usersSeed";

export default function useUsers() {
  const [rows, setRows] = useState(usersSeed);
  const [tab, setTab] = useState("all"); // all | golfer | staff | admin
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState("all");

  const create = useCallback((u) => {
    setRows((r) => [{ ...u, id: crypto.randomUUID() }, ...r]);
  }, []);
  const update = useCallback((id, patch) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);
  const remove = useCallback(
    (id) => setRows((r) => r.filter((x) => x.id !== id)),
    []
  );
  const getById = useCallback(
    (id) => rows.find((x) => x.id === id) || null,
    [rows]
  );

  const courses = useMemo(() => {
    const set = new Set(rows.map((r) => r.course));
    return ["all", ...Array.from(set)];
  }, [rows]);

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

  return {
    rows,
    filtered,
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
    remove,
    getById,
  };
}
