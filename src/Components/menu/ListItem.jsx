import React from "react";

const badge = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  draft: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default React.memo(function ListItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border px-3 py-3 flex gap-3 items-center
        ${
          active
            ? "border-indigo-200 bg-indigo-50/60"
            : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
    >
      <img
        src={item.image}
        alt=""
        className="h-10 w-10 rounded-md object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="truncate font-medium text-gray-900">{item.name}</div>
          <span
            className={`ml-2 shrink-0 text-[11px] px-2 py-0.5 rounded-full ring-1 ${
              badge[item.status]
            }`}
          >
            {item.status === "active" ? "Active" : "Draft"}
          </span>
        </div>
        <div className="truncate text-xs text-gray-500">{item.blurb}</div>
        <div className="mt-1 text-sm font-semibold text-indigo-600">
          ${item.price.toFixed(2)}
        </div>
      </div>
    </button>
  );
});
