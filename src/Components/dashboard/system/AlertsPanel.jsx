import React, { useMemo } from "react";
import { MdCheckCircle, MdError, MdWarningAmber } from "react-icons/md";
import Card from "../../ui/shared/Card";

const ICONS = {
  ok: { C: MdCheckCircle, classes: "text-emerald-600" },
  error: { C: MdError, classes: "text-rose-600" },
  warn: { C: MdWarningAmber, classes: "text-amber-600" },
};

const AlertsPanel = React.memo(function AlertsPanel({ items = [], onViewAll }) {
  const rows = useMemo(() => items, [items]);

  return (
    <Card title="System Health & Alerts">
      <ul className="space-y-3">
        {rows.map((a) => {
          const Icon = ICONS[a.type]?.C || MdWarningAmber;
          const color = ICONS[a.type]?.classes || "text-gray-500";
          return (
            <li key={a.id} className="flex items-start gap-2">
              <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
              <div className="text-sm text-gray-700">
                {a.text}{" "}
                {a.cta && (
                  <span className="text-rose-600 font-medium">{a.cta}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        onClick={onViewAll}
        className="mt-5 inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        View All Alerts
      </button>
    </Card>
  );
});

export default AlertsPanel;
