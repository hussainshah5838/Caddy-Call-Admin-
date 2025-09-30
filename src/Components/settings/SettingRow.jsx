import React from "react";
import { MdArrowForward } from "react-icons/md";

const base =
  "w-full text-left rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm";

export default React.memo(function SettingRow({
  title,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <div className={`${base} ${isOpen ? "ring-1 ring-emerald-100" : ""}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-gray-800">{title}</span>

        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-white
            ${isOpen ? "bg-emerald-700" : "bg-emerald-700/90"}`}
        >
          <MdArrowForward
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </span>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-gray-50/70 p-4 text-[13px] leading-6 text-gray-700">
            {children}
          </div>
        </div>
      )}
    </div>
  );
});
