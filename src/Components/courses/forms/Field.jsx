import React from "react";

export default function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
