import React, { useEffect, useState } from "react";
import StatsOverview from "../Components/dashboard/stats/StatsOverview";
import OperationalInsightsStatic from "../Components/dashboard/sections/OperationalInsightsStatic";
import ActivityFeed from "../Components/dashboard/activity/ActivityFeed";
import QuickActionsPanel from "../Components/dashboard/system/QuickActionsPanel";
import { activityFeed } from "../Data/activity";
import { quickActions } from "../Data/system";
import Footer from "../layouts/Footer";

const FALLBACK_STATS = [
  {
    key: "orders",
    title: "Total Orders",
    value: 37,
    delta: -100,
    sub: "from last month",
    icon: "cart",
  },
  {
    key: "staff",
    title: "Staff Members",
    value: 29,
    delta: -80,
    sub: "total staff members",
    icon: "users",
  },
  {
    key: "revenue",
    title: "Monthly Revenue",
    value: 0,
    currency: "USD",
    delta: -100,
    sub: "vs previous month",
    icon: "money",
  },
];

export default function CourseAdminDashboard() {
  const [stats, setStats] = useState(
    FALLBACK_STATS.map((item) => ({ ...item, loading: true }))
  );
  const [activityRows, setActivityRows] = useState(activityFeed);

  const toRelativeTime = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "now";
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / (60 * 1000));
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  const courseAdminQuickActions = quickActions
    .filter((action) => action.id !== "add-course")
    .map((action) => {
      if (action.id === "users") {
        return { ...action, label: "Manage Staff", to: "/course-admin/staff" };
      }
      if (action.id === "settings") {
        return { ...action, to: "/course-admin/settings" };
      }
      return action;
    });

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    const fetchCourseAdminStats = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (isMounted) setStats(FALLBACK_STATS);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/course-admin/dashboard-stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.stats) {
          if (isMounted) setStats(FALLBACK_STATS);
          return;
        }

        const nextStats = [
          {
            key: "orders",
            title: "Total Orders",
            value: Number(data.stats.totalOrders?.current || 0),
            delta: Number(data.stats.totalOrders?.percentageChange || 0),
            sub: "from last month",
            icon: "cart",
            loading: false,
          },
          {
            key: "staff",
            title: "Staff Members",
            value: Number(data.stats.staffMembers?.current || 0),
            delta: Number(data.stats.staffMembers?.percentageChange || 0),
            sub: "total staff members",
            icon: "users",
            loading: false,
          },
          {
            key: "revenue",
            title: "Monthly Revenue",
            value: Number(data.stats.courseRevenue?.current || 0),
            currency: "USD",
            delta: Number(data.stats.courseRevenue?.percentageChange || 0),
            sub: "vs previous month",
            icon: "money",
            loading: false,
          },
        ];

        if (isMounted) {
          setStats(nextStats);
        }
      } catch {
        if (isMounted) setStats(FALLBACK_STATS);
      }
    };

    fetchCourseAdminStats();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    const fetchRecentActivity = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/course-admin-notifications/activity-feed`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.activities)) {
          return;
        }

        const mapped = data.activities.slice(0, 8).map((row) => {
          return {
            id: String(row?.id || `${row?.createdAt || ""}`),
            icon: row?.icon || "status",
            text: row?.text || "Activity updated.",
            time: toRelativeTime(row?.createdAt),
          };
        });

        if (isMounted) {
          setActivityRows(mapped);
        }
      } catch {
        // Keep existing fallback activity on failure.
      }
    };

    fetchRecentActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <StatsOverview title="Course Admin Dashboard" stats={stats} />
      <OperationalInsightsStatic />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickActionsPanel actions={courseAdminQuickActions} />
        <ActivityFeed items={activityRows} />
      </div>
      <Footer />
    </div>
  );
}
