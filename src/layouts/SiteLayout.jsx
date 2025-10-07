import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "../Components/ui/section/LeftSidebar";
import Header from "../Components/ui/section/Header";
import { useAuth } from "../context/AuthContext.jsx";

const DashboardLayout = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar (fixed on mobile, inline on lg+) */}
      <LeftSidebar isOpen={leftSidebarOpen} setIsOpen={setLeftSidebarOpen} />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="GolfLink Admin"
          logoSrc="/logo.png"
          avatarSrc={user?.avatar || "public/profile.png"}
          notifications={9}
          onMenuClick={() => setLeftSidebarOpen(true)}
          onNotificationClick={() => console.log("open notifications")}
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
