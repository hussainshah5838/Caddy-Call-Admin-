import React from "react";

const ChartCard = React.memo(function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
});

export default ChartCard;
