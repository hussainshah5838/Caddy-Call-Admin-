import React, { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import LeftSidebar from "../Components/ui/section/LeftSidebar";
import CourseAdminLeftSidebar from "../Components/ui/section/CourseAdminLeftSidebar";
import Header from "../Components/ui/section/Header";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const DashboardLayout = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const SidebarComponent = isCourseAdmin ? CourseAdminLeftSidebar : LeftSidebar;
  const unreadCountPath = isCourseAdmin
    ? "/course-admin-notifications/unread-count"
    : "/super-admin-notifications/unread-count";
  const notificationsUpdatedEvent = isCourseAdmin
    ? "courseadmin-notifications-updated"
    : "superadmin-notifications-updated";

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem("auth:token");
    if (!token) {
      setUnreadCount(0);
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
        setUnreadCount(Number(data?.unreadCount || 0));
      } else {
        setUnreadCount(0);
      }
    } catch {
      setUnreadCount(0);
    }
  }, [user, unreadCountPath]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, pathname]);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      fetchUnreadCount();
    };
    window.addEventListener(notificationsUpdatedEvent, handleNotificationsUpdated);
    return () => {
      window.removeEventListener(notificationsUpdatedEvent, handleNotificationsUpdated);
    };
  }, [fetchUnreadCount, notificationsUpdatedEvent]);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar (fixed on mobile, inline on lg+) */}
      <SidebarComponent
        isOpen={leftSidebarOpen}
        setIsOpen={setLeftSidebarOpen}
        notificationBadge={unreadCount}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="GolfLink Admin"
          logoSrc="/logo.png"
          avatarSrc={user?.avatar || "public/profile.png"}
          notifications={unreadCount}
          onMenuClick={() => setLeftSidebarOpen(true)}
          onNotificationClick={() =>
            navigate(isCourseAdmin ? "/course-admin/notifications" : "/notifications")
          }
          onSettingsClick={() => console.log("open settings")}
          onProfileClick={() => console.log("open profile")}
          onSearch={(term) => console.log("search:", term)}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Wider on big screens, modest padding on small */}
          <div className="
              mx-auto w-full
              max-w-screen-xl sm:max-w-screen-xl lg:max-w-screen-2xl 2xl:max-w-[1600px]
              px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10
              py-4 lg:py-6
            ">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
