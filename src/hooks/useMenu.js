import { useCallback, useMemo, useState } from "react";
import { initialMenu, initialAssets } from "../Data/menuItems";

export default function useMenu() {
  const [items, setItems] = useState(initialMenu);
  const [assets, setAssets] = useState(initialAssets);
  const [selectedId, setSelectedId] = useState(items[0]?.id || null);
  const [query, setQuery] = useState("");

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
