import React from "react";
import AlertsPanel from "../system/AlertsPanel";
import QuickActionsPanel from "../system/QuickActionsPanel";

const SystemUtilities = React.memo(function SystemUtilities({
  alerts = [],
  actions = [],
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-800">System Utilities</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertsPanel
          items={alerts}
          onViewAll={() => console.log("open all alerts")}
        />
        <QuickActionsPanel actions={actions} />
      </div>
    </section>
  );
});

export default SystemUtilities;
