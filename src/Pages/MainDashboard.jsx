import React, { useEffect, useState } from "react";
import StatsOverview from "../Components/dashboard/stats/StatsOverview";
import OperationalInsights from "../Components/dashboard/sections/OperationalInsights";
import CoursePerformance from "../Components/dashboard/sections/CoursePerformance";
import SystemUtilities from "../Components/dashboard/sections/SystemUtilities";
import { activityFeed } from "../Data/activity";
import { alerts, quickActions } from "../Data/system";
import Footer from "../layouts/Footer";

const LOADING_STATS = [
  {
    key: "orders",
    title: "Total Orders",
    value: 0,
    delta: 0,
    sub: "from last month",
    icon: "cart",
    loading: true,
  },
  {
    key: "users",
    title: "Registered Users",
    value: 0,
    delta: 0,
    sub: "total golfers & staff",
    icon: "users",
    loading: true,
  },
  {
    key: "revenue",
    title: "Monthly Revenue",
    value: 0,
    currency: "USD",
    delta: 0,
    sub: "vs previous month",
    icon: "money",
    loading: true,
  },
  {
    key: "courses",
    title: "Active Golf Courses",
    value: 0,
    delta: 0,
    sub: "from last quarter",
    icon: "pin",
    loading: true,
  },
];

export default function MainDashboard() {
  const [stats, setStats] = useState(LOADING_STATS);
  const [courseRows, setCourseRows] = useState([]);
  const [activityRows, setActivityRows] = useState(activityFeed);

  const toRelativeTime = (value) => {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "Just now";

    const diffMs = Date.now() - dt.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return "Just now";
    if (diffMs < hour) {
      const mins = Math.max(1, Math.floor(diffMs / minute));
      return `${mins} min${mins > 1 ? "s" : ""} ago`;
    }
    if (diffMs < day) {
      const hrs = Math.max(1, Math.floor(diffMs / hour));
      return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    }
    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const toActivityIcon = (notificationType = "") => {
    const normalized = String(notificationType).trim().toLowerCase();
    if (normalized === "course_status_change") return "status";
    if (normalized === "new_course") return "report";
    return "booking";
  };

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    const fetchSuperAdminStats = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/super-admin/dashboard-stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.stats) return;

        const nextStats = [
          {
            key: "orders",
            title: "Total Orders",
            value: Number(data.stats.totalOrders?.allTime || 0),
            delta: Number(data.stats.totalOrders?.percentageChange || 0),
            sub: "from last month",
            icon: "cart",
            loading: false,
          },
          {
            key: "users",
            title: "Registered Users",
            value: Number(data.stats.registeredUsers?.allTime || 0),
            delta: Number(data.stats.registeredUsers?.percentageChange || 0),
            sub: "total golfers & staff",
            icon: "users",
            loading: false,
          },
          {
            key: "revenue",
            title: "Monthly Revenue",
            value: Number(data.stats.monthlyRevenue?.current || 0),
            currency: "USD",
            delta: Number(data.stats.monthlyRevenue?.percentageChange || 0),
            sub: "vs previous month",
            icon: "money",
            loading: false,
          },
          {
            key: "courses",
            title: "Active Golf Courses",
            value: Number(data.stats.activeCourses?.current || 0),
            delta: Number(data.stats.activeCourses?.change || 0),
            sub: "from last quarter",
            icon: "pin",
            loading: false,
          },
        ];

        if (isMounted) {
          setStats(nextStats);
        }
      } catch {
        // Keep existing static fallback stats on request failure.
      }
    };

    fetchSuperAdminStats();

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
        const response = await fetch(`${API_BASE_URL}/super-admin-notifications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.notifications)) {
          return;
        }

        const mapped = data.notifications.slice(0, 8).map((n) => ({
          id: n?._id || Math.random(),
          icon: toActivityIcon(n?.notificationType),
          text: n?.message || "System update",
          time: toRelativeTime(n?.createdAt),
        }));

        if (isMounted) {
          setActivityRows(mapped);
        }
      } catch {
        // Keep static fallback activity on request failure.
      }
    };

    fetchRecentActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    const fetchCourses = async () => {
      const token = localStorage.getItem("auth:token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/courses/dashboard-performance`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.courses)) {
          return;
        }

        const mapped = data.courses.map((course) => ({
          id: course?._id || course?.id,
          name: course?.courseName || "Course",
          image:
            course?.photo ||
            "https://picsum.photos/seed/course-default/400/250",
          status: course?.status || "Active",
          revenue: Number(course?.revenue || 0),
          staff: Number(course?.staff || 0),
          location: course?.location?.address || "",
          hours: course?.hours || null,
          taxRate: course?.taxRate,
          deliveryFee: course?.deliveryFee,
          dueDate: course?.dueDate || null,
          assignedAdmins: Array.isArray(course?.assignedAdmins)
            ? course.assignedAdmins
            : [],
        }));

        if (isMounted) {
          setCourseRows(mapped);
        }
      } catch {
        // Keep current course rows on request failure.
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <StatsOverview stats={stats} />
      <OperationalInsights />
      <CoursePerformance courses={courseRows} activity={activityRows} />
      <SystemUtilities alerts={alerts} actions={quickActions} />
      <Footer />
    </div>
  );
}
