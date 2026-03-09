import {
  MdDashboard,
  MdPeople,
  MdSettings,
  MdPerson,
  MdNotifications,
  MdBarChart,
  MdGolfCourse,
  MdStorefront,
  MdLogout,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { hasAccess } from "../../../routes/RequireAccess.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const NAV = [
  { icon: MdDashboard, label: "Dashboard", path: "/" },
  { icon: MdGolfCourse, label: "Courses", path: "/courses", kinds: ["admin", "staff"] },
  { icon: MdPeople, label: "Users", path: "/users", kinds: ["admin"] },
  {
    icon: MdBarChart,
    label: "Menu Management",
    path: "/menu",
    kinds: ["admin", "staff"],
    roles: ["Super Admin", "Course Admin", "Kitchen Staff"],
  },
  {
    icon: MdStorefront,
    label: "Pro Shop",
    path: "/course-admin/pro-shop",
    roles: ["Course Admin"],
  },
  {
    icon: MdNotifications,
    label: "Notifications",
    path: "/notifications",
    badge: 9,
  },
  { icon: MdSettings, label: "Settings", path: "/settings", kinds: ["admin"] },
];

export default function CourseAdminLeftSidebar({ isOpen, setIsOpen, notificationBadge }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const unreadCountPath = isCourseAdmin
    ? "/course-admin-notifications/unread-count"
    : "/super-admin-notifications/unread-count";

  const isActive = (p) => {
    if (p === "/" || p === "/course-admin") return pathname === p;
    return pathname === p || pathname.startsWith(`${p}/`);
  };

  const handleLogout = () => {
    logout();
  };

  const filteredNav = useMemo(() => {
    if (!user) return [];
    const badgeValue =
      typeof notificationBadge === "number" ? notificationBadge : unreadCount;
    const items = NAV.filter((item) => hasAccess(user, item.kinds, item.roles));
    return items.map((item) => {
      if (item.label === "Dashboard" && isCourseAdmin) {
        return { ...item, path: "/course-admin" };
      }
      if (item.label === "Courses" && isCourseAdmin) {
        return { ...item, label: "Course", path: "/course-admin/courses" };
      }
      if (item.label === "Menu Management" && isCourseAdmin) {
        return { ...item, path: "/course-admin/menu" };
      }
      if (item.label === "Notifications") {
        if (isCourseAdmin) {
          return { ...item, path: "/course-admin/notifications", badge: badgeValue };
        }
        return { ...item, badge: badgeValue };
      }
      if (item.label === "Settings" && isCourseAdmin) {
        return { ...item, path: "/course-admin/settings" };
      }
      if (item.label === "Users" && isCourseAdmin) {
        return { ...item, label: "Staff", path: "/course-admin/staff" };
      }
      return item;
    });
  }, [user, unreadCount, notificationBadge]);

  useEffect(() => {
    let mounted = true;

    const fetchUnreadCount = async () => {
      if (!user) {
        if (mounted) setUnreadCount(0);
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (mounted) setUnreadCount(0);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}${unreadCountPath}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data?.success) {
          if (mounted) setUnreadCount(Number(data?.unreadCount || 0));
        } else if (mounted) {
          setUnreadCount(0);
        }
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    return () => {
      mounted = false;
    };
  }, [user, pathname, unreadCountPath]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white
        border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        {/* header / logo */}
        <div className="h-16 px-5 flex items-center justify-between">
          <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <IoClose size={22} />
          </button>
        </div>

        <div className="px-5">
          <div className="h-px bg-gray-200" />
        </div>

        {/* nav */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-2">
            {filteredNav.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition
                      ${
                        active
                          ? "bg-[#0d3b2e] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        active
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        active ? "text-white" : ""
                      }`}
                    >
                      {item.label}
                    </span>

                    {item.badge ? (
                      <span
                        className={`ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full
                          px-1.5 text-xs font-semibold
                          ${
                            active
                              ? "bg-white/90 text-[#0d3b2e]"
                              : "bg-red-500 text-white"
                          }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* footer */}
        <div className="mt-auto">
          <div className="px-5">
            <div className="h-px bg-gray-200" />
          </div>

          <div className="px-3 py-4 space-y-1">
            <Link
              to="/course-admin/account"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                       text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <MdPerson className="h-5 w-5 text-gray-400" />
              Account
            </Link>

            <Link
              to="/auth/login"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                       text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <MdLogout className="h-5 w-5 text-gray-400" />
              Logout
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
