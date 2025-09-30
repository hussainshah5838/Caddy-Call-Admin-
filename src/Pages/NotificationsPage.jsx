import React from "react";
import { notifications } from "../Data/notifications";
import NotificationsList from "../Components/notifications/NotificationsList";

export default function NotificationsPage() {
  // local state if you want to mark items as read on click
  const [items, setItems] = React.useState(notifications);

  const handleItemClick = (item) => {
    // Example: mark as read + navigate or open panel
    setItems((arr) =>
      arr.map((x) => (x.id === item.id ? { ...x, unread: false } : x))
    );
    console.log("Open notification:", item.id);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Notification</h1>
        <p className="text-sm text-gray-500">
          Manage all users registered on the Golf Platform, including golfers
          and staff members.
        </p>
      </div>

      {/* Centered column that matches your screenshot width */}
      <div className="max-w-2xl">
        <NotificationsList items={items} onItemClick={handleItemClick} />
      </div>
    </div>
  );
}
