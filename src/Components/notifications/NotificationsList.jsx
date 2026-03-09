import React, { useMemo } from "react";
import NotificationItem from "./NotificationItem";

const NotificationsList = React.memo(function NotificationsList({
  items = [],
  loading = false,
  onItemClick,
  hideAvatar = false,
}) {
  const list = useMemo(() => items, [items]);

  return (
    <div className="space-y-3">
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          <div className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            Loading notifications...
          </div>
        </div>
      )}

      {list.map((n) => (
        <NotificationItem
          key={n.id}
          item={n}
          onClick={onItemClick}
          hideAvatar={hideAvatar}
        />
      ))}
      {!loading && list.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          You’re all caught up.
        </div>
      )}
    </div>
  );
});

export default NotificationsList;
