import React, { useMemo } from "react";
import ListItem from "./ListItem";
import { MdAdd } from "react-icons/md";

export default React.memo(function MenuList({
  items,
  query,
  setQuery,
  selectedId,
  onSelect,
  onAdd,
}) {
  const list = useMemo(() => items, [items]);

  return (
    <aside className="w-full md:w-80">
      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="text-sm font-semibold text-gray-900 mb-3">
          Menu Items ({list.length})
        </div>

        <div className="mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu items…"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2 max-h-[540px] overflow-auto pr-1">
          {list.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              active={item.id === selectedId}
              onClick={() => onSelect(item.id)}
            />
          ))}
          {list.length === 0 && (
            <div className="text-center text-xs text-gray-500 py-10">
              No items found.
            </div>
          )}
        </div>

        <button
          onClick={onAdd}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          <MdAdd className="h-4 w-4" /> Add New Menu Item
        </button>
      </div>
    </aside>
  );
});
