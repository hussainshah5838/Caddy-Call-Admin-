import React from "react";
import { MdFilterList, MdSort, MdAdd, MdSearch } from "react-icons/md";

export default function CoursesFilterBar({
  query,
  setQuery,
  status,
  setStatus,
  sort,
  setSort,
  onAdd,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* search */}
      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-full max-w-sm">
          <MdSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm"
          />
        </div>

        {/* filter */}
        <div className="inline-flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
            <MdFilterList className="h-4 w-4 text-gray-500" />
            <select
              className="bg-transparent outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Filter Status: All</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
            <MdSort className="h-4 w-4 text-gray-500" />
            <select
              className="bg-transparent outline-none"
              value={`${sort.by}:${sort.dir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split(":");
                setSort({ by, dir });
              }}
            >
              <option value="name:asc">Sort by: name (asc)</option>
              <option value="name:desc">Sort by: name (desc)</option>
              <option value="order:asc">Sort by: # (asc)</option>
              <option value="order:desc">Sort by: # (desc)</option>
            </select>
          </div>
        </div>
      </div>

      {/* add button */}
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-md bg-emerald-700 text-white px-3 py-2 text-sm hover:bg-emerald-800"
      >
        <MdAdd className="h-5 w-5" />
        Add New Course
      </button>
    </div>
  );
}
