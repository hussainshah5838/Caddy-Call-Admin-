import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MdAddCircleOutline,
  MdBarChart,
  MdPeopleOutline,
  MdSettings,
} from "react-icons/md";
import Card from "../../ui/shared/Card";

const ICONS = {
  plus: MdAddCircleOutline,
  chart: MdBarChart,
  users: MdPeopleOutline,
  settings: MdSettings,
};

const QuickActionsPanel = React.memo(function QuickActionsPanel({
  actions = [],
}) {
  const rows = useMemo(() => actions, [actions]);

  return (
    <Card title="Quick Actions" subtitle="Perform common tasks swiftly.">
      <div className="space-y-3">
        {rows.map((a) => {
          const Icon = ICONS[a.icon] || MdAddCircleOutline;
          return (
            <Link
              key={a.id}
              to={a.to}
              className="flex items-center gap-3 rounded-md border border-rose-100 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50/50"
            >
              <Icon className="h-4 w-4" />
              <span>{a.label}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
});

export default QuickActionsPanel;
