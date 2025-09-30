import { useMemo, useState, useCallback } from "react";
import { coursesSeed } from "../Data/coursesSeed";

export default function useCourses() {
  const [rows, setRows] = useState(coursesSeed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ by: "name", dir: "asc" });

  const create = useCallback((course) => {
    setRows((r) => [{ ...course, id: crypto.randomUUID() }, ...r]);
  }, []);

  const update = useCallback((id, patch) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const remove = useCallback((id) => {
    setRows((r) => r.filter((x) => x.id !== id));
  }, []);

  const getById = useCallback(
    (id) => rows.find((r) => r.id === id) || null,
    [rows]
  );

  const toggleStatus = useCallback((id) => {
    setRows((r) =>
      r.map((x) =>
        x.id === id
          ? { ...x, status: x.status === "active" ? "maintenance" : "active" }
          : x
      )
    );
  }, []);

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

  return {
    rows,
    filtered,
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
