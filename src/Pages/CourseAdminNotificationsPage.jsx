import React from "react";
import NotificationsList from "../Components/notifications/NotificationsList";

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

function mapNotificationRow(row, fallbackUserName = "") {
  const userName =
    row?.order?.user?.name ||
    fallbackUserName ||
    row?.order?.userName ||
    `Order #${row?.orderId || ""}` ||
    "System";
  const totalItems = Number(row?.totalItems || 0);
  const totalAmount = Number(row?.totalAmount || 0);
  return {
    id: String(row?._id || ""),
    source: "order",
    user: userName,
    avatar: row?.order?.user?.photo || toAvatarUrl(userName),
    time: toRelativeTime(row?.createdAt),
    text: `Order #${row?.orderId || "-"} • ${totalItems} item${totalItems === 1 ? "" : "s"} • $${totalAmount.toFixed(2)}`,
    unread: !row?.isRead,
    createdAt: row?.createdAt,
    markReadId: String(row?._id || ""),
  };
}

function mapActivityRow(row) {
  return {
    id: String(row?.id || row?._id || `activity-${row?.createdAt || Date.now()}`),
    source: "activity",
    user: "Activity",
    avatar: toAvatarUrl("Activity"),
    time: toRelativeTime(row?.createdAt),
    text: row?.text || "Activity updated.",
    unread: false,
    createdAt: row?.createdAt,
    markReadId: null,
  };
}

export default function CourseAdminNotificationsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [markingAll, setMarkingAll] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchNotifications = React.useCallback(async () => {
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
      const [ordersResponse, activityResponse, courseOrdersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/course-admin-notifications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/course-admin-notifications/activity-feed`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/orders/course-admin`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const ordersData = await ordersResponse.json().catch(() => ({}));
      if (!ordersResponse.ok || !ordersData?.success || !Array.isArray(ordersData?.notifications)) {
        throw new Error(ordersData?.message || "Failed to fetch notifications.");
      }

      const activityData = await activityResponse.json().catch(() => ({}));
      const courseOrdersData = await courseOrdersResponse.json().catch(() => ({}));

      // Build fallback map: orderId -> golfer name (course admin orders endpoint).
      // This helps when notification payload contains order.user as an ID instead of a populated object.
      const orderNameByOrderId =
        courseOrdersResponse.ok &&
        courseOrdersData?.success &&
        Array.isArray(courseOrdersData?.orders)
          ? new Map(
              courseOrdersData.orders
                .filter((order) => order?.orderId !== undefined)
                .map((order) => [Number(order.orderId), order?.user?.name || ""])
            )
          : new Map();

      const orderItems = ordersData.notifications.map((row) =>
          mapNotificationRow(row, orderNameByOrderId.get(Number(row?.orderId)) || "")
      );
      const activityItems =
        activityResponse.ok && activityData?.success && Array.isArray(activityData?.activities)
          ? activityData.activities.map((row) => mapActivityRow(row))
          : [];

      const merged = [...orderItems, ...activityItems].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setItems(merged);
    } catch (err) {
      setItems([]);
      setError(err?.message || "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleItemClick = async (item) => {
    const token = localStorage.getItem("auth:token");
    if (!token || !item?.markReadId || !item.unread) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/course-admin-notifications/${item.markReadId}/read`,
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
      window.dispatchEvent(new Event("courseadmin-notifications-updated"));
    } catch {}

    setItems((arr) =>
      arr.map((x) => (x.id === item.id ? { ...x, unread: false } : x))
    );
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("auth:token");
    if (!token || markingAll) return;

    setMarkingAll(true);
    try {
      const unread = items.filter((x) => x.unread && x.markReadId);
      await Promise.all(
        unread.map((x) =>
          fetch(`${API_BASE_URL}/course-admin-notifications/${x.markReadId}/read`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.success) {
              throw new Error(data?.message || "Failed to mark all notifications as read.");
            }
          })
        )
      );
      setItems((arr) => arr.map((x) => ({ ...x, unread: false })));
      window.dispatchEvent(new Event("courseadmin-notifications-updated"));
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
          hideAvatar
        />
      </div>
    </div>
  );
}
