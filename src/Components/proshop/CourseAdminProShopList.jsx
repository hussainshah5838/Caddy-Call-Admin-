import React, { useMemo } from "react";
import ListItem from "../menu/ListItem";
import { MdAdd } from "react-icons/md";

export default React.memo(function CourseAdminProShopList({
  items,
  loading = false,
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
          Pro Shop Items ({list.length})
        </div>

        <div className="mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pro shop items..."
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2 max-h-[540px] overflow-auto pr-1">
          {loading && (
            <div className="py-10 text-center text-xs text-gray-500">
              <div className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Loading pro shop items...
              </div>
            </div>
          )}

          {list.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              active={item.id === selectedId}
              onClick={() => onSelect(item.id)}
            />
          ))}
          {!loading && list.length === 0 && (
            <div className="text-center text-xs text-gray-500 py-10">
              No pro shop items found.
            </div>
          )}
        </div>

        <button
          onClick={onAdd}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          <MdAdd className="h-4 w-4" /> Add New Pro Shop Item
        </button>
      </div>
    </aside>
  );
});
