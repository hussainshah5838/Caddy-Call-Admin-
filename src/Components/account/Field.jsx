import React from "react";

const Field = React.memo(function Field({
  label,
  children,
  hint,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-gray-600 mb-1">{label}</label>
      )}
      {children}
      {hint && <div className="mt-1 text-[11px] text-gray-400">{hint}</div>}
    </div>
  );
});

export default Field;
