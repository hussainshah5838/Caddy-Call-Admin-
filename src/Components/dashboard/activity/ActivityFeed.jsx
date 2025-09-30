import React from "react";
import {
  MdCheckCircle,
  MdDescription,
  MdUpdate,
  MdEventAvailable,
} from "react-icons/md";

const ICONS = {
  booking: MdEventAvailable,
  status: MdUpdate,
  system: MdCheckCircle,
  report: MdDescription,
};

const ActivityFeed = React.memo(function ActivityFeed({ items = [] }) {
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      <p className="mt-1 mb-4 text-xs text-gray-500">
        Latest updates and events across the platform.
      </p>

      <ol className="space-y-4">
        {items.map((it) => {
          const Icon = ICONS[it.icon] || MdUpdate;
          return (
            <li key={it.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                <Icon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-800">{it.text}</div>
                <div className="text-xs text-gray-400">{it.time}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
});

export default ActivityFeed;
