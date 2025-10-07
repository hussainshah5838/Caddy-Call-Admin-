import { useCallback, useEffect, useMemo, useState } from "react";
import { initialMenu, initialAssets } from "../Data/menuItems";
import { useAuth } from "../context/AuthContext.jsx";

export default function useMenu() {
  const { user } = useAuth();

  const storageKeys = useMemo(() => {
    if (!user) return { items: null, assets: null };
    return { items: `menu:${user.id}`, assets: `menuAssets:${user.id}` };
  }, [user]);

  const [items, setItems] = useState(initialMenu);
  const [assets, setAssets] = useState(initialAssets);
  const [selectedId, setSelectedId] = useState(items[0]?.id || null);
  const [query, setQuery] = useState("");

  // Load per-user menu + assets on user change
  useEffect(() => {
    if (!storageKeys.items || !storageKeys.assets) return;
    try {
      const rawItems = localStorage.getItem(storageKeys.items);
      const rawAssets = localStorage.getItem(storageKeys.assets);
      setItems(rawItems ? JSON.parse(rawItems) : initialMenu);
      setAssets(rawAssets ? JSON.parse(rawAssets) : initialAssets);
    } catch {
      setItems(initialMenu);
      setAssets(initialAssets);
    }
    // reset selection on user change
    setSelectedId(initialMenu[0]?.id || null);
    setQuery("");
  }, [storageKeys.items, storageKeys.assets]);

  // Persist changes per-user
  useEffect(() => {
    if (!storageKeys.items) return;
    try {
      localStorage.setItem(storageKeys.items, JSON.stringify(items));
    } catch {}
  }, [items, storageKeys.items]);

  useEffect(() => {
    if (!storageKeys.assets) return;
    try {
      localStorage.setItem(storageKeys.assets, JSON.stringify(assets));
    } catch {}
  }, [assets, storageKeys.assets]);

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

  const save = useCallback((payload) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === payload.id);
      if (idx === -1) return [{ ...payload }, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...payload };
      return copy;
    });
    setSelectedId(payload.id);
  }, []);

  const create = useCallback(() => {
    const id = crypto.randomUUID();
    const draft = {
      id,
      name: "New Item",
      blurb: "Short description…",
      price: 0,
      status: "draft",
      image: `https://picsum.photos/seed/${id}-new/600/400`,
      alt: "",
      description: "",
    };
    setItems((p) => [draft, ...p]);
    setSelectedId(id);
  }, []);

  const remove = useCallback((id) => {
    setItems((p) => p.filter((i) => i.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const upsertAsset = useCallback((fileOrUrl) => {
    // demo: if it's a file, make an object URL; if string, use it directly
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
