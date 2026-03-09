import { useCallback, useEffect, useMemo, useState } from "react";
import { initialAssets } from "../Data/menuItems";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const toStatusForUi = (status = "") => {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "active") return "active";
  if (normalized === "inactive") return "inactive";
  return "draft";
};

const toStatusForApi = (status = "") => {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "inactive") return "Inactive";
  return "Draft";
};

const toUiItem = (row) => {
  const id = String(row?._id || "");
  const description = row?.description || "";
  return {
    id,
    name: row?.name || "Untitled Item",
    blurb: description || "Short description...",
    price: Number(row?.price || 0),
    status: toStatusForUi(row?.status),
    category: row?.category || "",
    menuSection: "",
    image:
      row?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(id)}/600/400`,
    alt: row?.imageAltText || "",
    description,
    isNew: false,
  };
};

export default function useProShop(options = {}) {
  const { courseId = "" } = options;
  const { user } = useAuth();

  const storageKeys = useMemo(() => {
    if (!user) return { assets: null };
    return { assets: `proShopAssets:${user.id}` };
  }, [user]);

  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState(initialAssets);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!storageKeys.assets) return;
    try {
      const rawAssets = localStorage.getItem(storageKeys.assets);
      setAssets(rawAssets ? JSON.parse(rawAssets) : initialAssets);
    } catch {
      setAssets(initialAssets);
    }
  }, [storageKeys.assets]);

  useEffect(() => {
    if (!storageKeys.assets) return;
    try {
      localStorage.setItem(storageKeys.assets, JSON.stringify(assets));
    } catch {}
  }, [assets, storageKeys.assets]);

  useEffect(() => {
    let mounted = true;

    const fetchItems = async () => {
      if (!user) {
        if (!mounted) return;
        setItems([]);
        setSelectedId(null);
        setLoading(false);
        setError("");
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (!mounted) return;
        setItems([]);
        setSelectedId(null);
        setLoading(false);
        setError("Authentication token not found.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const url = new URL(`${API_BASE_URL}/proshop`);
        if (courseId) url.searchParams.set("course", courseId);

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.items)) {
          throw new Error(data?.message || "Failed to load pro shop items.");
        }

        if (!mounted) return;
        const nextItems = data.items.map(toUiItem);
        setItems(nextItems);
        setSelectedId((current) => {
          if (current && nextItems.some((x) => x.id === current)) return current;
          return nextItems[0]?.id || null;
        });
      } catch (err) {
        if (!mounted) return;
        setItems([]);
        setSelectedId(null);
        setError(err?.message || "Failed to load pro shop items.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchItems();
    return () => {
      mounted = false;
    };
  }, [user, refreshToken, courseId]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) || null,
    [items, selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) || i.blurb.toLowerCase().includes(q)
    );
  }, [items, query]);

  const save = useCallback(
    async (payload) => {
      if (saving) return;
      const token = localStorage.getItem("auth:token");
      if (!payload) return;
      if (!token) {
        const message = "Authentication token not found.";
        setError(message);
        toast.error(message);
        return;
      }

      setError("");
      setSaving(true);

      const isCreate = Boolean(payload.isNew);
      const endpoint = isCreate
        ? `${API_BASE_URL}/proshop`
        : `${API_BASE_URL}/proshop/${payload.id}`;
      const method = isCreate ? "POST" : "PUT";

      const body = {
        name: payload?.name || "",
        description: payload?.description || "",
        price: Number(payload?.price || 0),
        category: payload?.category || "",
        imageUrl: payload?.image || "",
        imageAltText: payload?.alt || "",
        status: toStatusForApi(payload?.status),
        ...(isCreate && courseId ? { course: courseId } : {}),
      };

      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to save pro shop item.");
        }

        const saved = data?.item ? toUiItem(data.item) : null;
        if (saved) {
          setItems((prev) => {
            if (isCreate) return [saved, ...prev.filter((x) => x.id !== payload.id)];
            return prev.map((x) => (x.id === payload.id ? saved : x));
          });
          setSelectedId(saved.id);
          toast.success(
            isCreate
              ? "Pro shop item added successfully."
              : "Pro shop item updated successfully."
          );
        } else {
          setRefreshToken((x) => x + 1);
          toast.success(
            isCreate
              ? "Pro shop item added successfully."
              : "Pro shop item updated successfully."
          );
        }
      } catch (err) {
        const message = err?.message || "Failed to save pro shop item.";
        setError(message);
        toast.error(message);
      } finally {
        setSaving(false);
      }
    },
    [saving, courseId]
  );

  const create = useCallback(() => {
    const id = `temp-${crypto.randomUUID()}`;
    const draft = {
      id,
      name: "New Item",
      blurb: "Short description...",
      price: 0,
      status: "draft",
      category: "",
      menuSection: "",
      image: "",
      alt: "",
      description: "",
      isNew: true,
    };
    setItems((p) => [draft, ...p]);
    setSelectedId(id);
    setError("");
  }, []);

  const remove = useCallback(
    async (id) => {
      if (deleting) return;

      if (String(id || "").startsWith("temp-")) {
        setItems((p) => p.filter((i) => i.id !== id));
        setSelectedId((cur) => (cur === id ? null : cur));
        toast.success("Pro shop item deleted successfully.");
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        const message = "Authentication token not found.";
        setError(message);
        toast.error(message);
        return;
      }

      setError("");
      setDeleting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/proshop/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to delete pro shop item.");
        }

        setItems((p) => p.filter((i) => i.id !== id));
        setSelectedId((cur) => (cur === id ? null : cur));
        toast.success("Pro shop item deleted successfully.");
      } catch (err) {
        const message = err?.message || "Failed to delete pro shop item.";
        setError(message);
        toast.error(message);
      } finally {
        setDeleting(false);
      }
    },
    [deleting]
  );

  const upsertAsset = useCallback((fileOrUrl) => {
    const id = crypto.randomUUID();
    const src =
      typeof fileOrUrl === "string"
        ? fileOrUrl
        : URL.createObjectURL(fileOrUrl);
    setAssets((a) => [{ id, label: "New Asset", src }, ...a]);
  }, []);

  return {
    items,
    filtered,
    loading,
    saving,
    deleting,
    error,
    selected,
    selectedId,
    setSelectedId,
    query,
    setQuery,
    save,
    create,
    remove,
    assets,
    upsertAsset,
  };
}
