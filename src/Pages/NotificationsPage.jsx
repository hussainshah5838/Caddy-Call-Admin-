import React from "react";
import NotificationsList from "../Components/notifications/NotificationsList";
import { notifications as notificationsSeed } from "../Data/notifications";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toRelativeTime(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
}

function toAvatarUrl(name = "System") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E5E7EB&color=111827&size=64`;
}

function mapNotificationRow(row) {
  const userName = row?.user?.name || "System";
  return {
    id: String(row?._id || ""),
    user: userName,
    avatar: row?.user?.photo || toAvatarUrl(userName),
    time: toRelativeTime(row?.createdAt),
    text: row?.message || "",
    unread: !row?.isRead,
  };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [markingAll, setMarkingAll] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchNotifications = React.useCallback(async () => {
    if (isCourseAdmin) {
      setItems(notificationsSeed);
      setLoading(false);
      setError("");
      return;
    }

    const token = localStorage.getItem("auth:token");
    if (!token) {
      setItems([]);
      setLoading(false);
      setError("Authentication token not found.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin-notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success || !Array.isArray(data?.notifications)) {
        throw new Error(data?.message || "Failed to fetch notifications.");
      }
      setItems(data.notifications.map((row) => mapNotificationRow(row)));
    } catch (err) {
      setItems([]);
      setError(err?.message || "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [isCourseAdmin]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleItemClick = async (item) => {
    if (isCourseAdmin) {
      setItems((arr) =>
        arr.map((x) => (x.id === item.id ? { ...x, unread: false } : x))
      );
      return;
    }

    const token = localStorage.getItem("auth:token");
    if (!token || !item?.id || !item.unread) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/super-admin-notifications/${item.id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark notification as read.");
      }
      window.dispatchEvent(new Event("superadmin-notifications-updated"));
    } catch {}

    setItems((arr) =>
      arr.map((x) => (x.id === item.id ? { ...x, unread: false } : x))
    );
  };

  const handleMarkAllRead = async () => {
    if (isCourseAdmin) {
      setItems((arr) => arr.map((x) => ({ ...x, unread: false })));
      return;
    }

    const token = localStorage.getItem("auth:token");
    if (!token || markingAll) return;

    setMarkingAll(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/super-admin-notifications/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to mark all notifications as read.");
      }
      window.dispatchEvent(new Event("superadmin-notifications-updated"));
      setItems((arr) => arr.map((x) => ({ ...x, unread: false })));
    } catch (err) {
      setError(err?.message || "Failed to mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
        <h1 className="text-xl font-semibold text-gray-900">Notification</h1>
        <p className="text-sm text-gray-500">
          Manage all users registered on the Golf Platform, including golfers
          and staff members.
        </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || loading || items.length === 0}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {markingAll ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Centered column that matches your screenshot width */}
      <div className="max-w-2xl">
        <NotificationsList
          items={items}
          loading={loading}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
}
