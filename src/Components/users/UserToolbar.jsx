import React from "react";
import { MdAdd, MdSearch, MdKeyboardArrowDown } from "react-icons/md";

const Tab = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm ${
      active
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

export default function UserToolbar({
  counts,
  tab,
  setTab,
  query,
  setQuery,
  course,
  setCourse,
  courseOptions = [],
  status,
  setStatus,
  onAdd,
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Tab active={tab === "all"} onClick={() => setTab("all")}>
          All Users ({counts.all})
        </Tab>
        <Tab active={tab === "golfer"} onClick={() => setTab("golfer")}>
          Golfers ({counts.golfer})
        </Tab>
        <Tab active={tab === "staff"} onClick={() => setTab("staff")}>
          Staff ({counts.staff})
        </Tab>
        <Tab active={tab === "admin"} onClick={() => setTab("admin")}>
          Admins ({counts.admin})
        </Tab>
      </div>

      {/* Search + Filters + Add */}
      <div className="flex flex-1 items-center gap-2 md:justify-end">
        <div className="relative w-full max-w-xs">
          <MdSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm"
          />
        </div>

        <div className="relative">
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm pr-8"
          >
            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Courses" : c}
              </option>
            ))}
          </select>
          <MdKeyboardArrowDown className="pointer-events-none absolute right-2.5 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm pr-8"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <MdKeyboardArrowDown className="pointer-events-none absolute right-2.5 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-700 text-white px-3 py-2 text-sm hover:bg-emerald-800"
        >
          <MdAdd className="h-5 w-5" />
          Add New User
        </button>
      </div>
    </div>
  );
}
