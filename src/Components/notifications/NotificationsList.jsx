import React, { useMemo } from "react";
import NotificationItem from "./NotificationItem";

const NotificationsList = React.memo(function NotificationsList({
  items = [],
  onItemClick,
}) {
  const list = useMemo(() => items, [items]);

  return (
    <div className="space-y-3">
      {list.map((n) => (
        <NotificationItem key={n.id} item={n} onClick={onItemClick} />
      ))}
      {list.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          You’re all caught up.
        </div>
      )}
    </div>
  );
});

export default NotificationsList;
