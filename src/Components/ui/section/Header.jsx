import React, { useState } from "react";
import {
  MdMenu,
  MdSearch,
  MdNotificationsNone,
  MdSettings,
} from "react-icons/md";

export default function Header({
  title = "GolfLink Admin",
  logoSrc = "/logo.png",
  avatarSrc = "public/profile.png",
  notifications = 0,
  onMenuClick,              // mobile: open left sidebar
  onNotificationClick,      // optional
  onSettingsClick,          // optional
  onProfileClick,           // optional
  onSearch,                 // optional
}) {
  const [q, setQ] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (onSearch) onSearch(q.trim());
  }

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white border-b border-gray-200">
      <div className="h-full mx-auto max-w-screen-2xl px-3 sm:px-5 flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="lg:hidden -ml-1 p-2 rounded-md hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <MdMenu className="h-5 w-5 text-gray-700" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <img src={logoSrc} alt="Logo" className="h-6 w-6 rounded-full object-cover" />
          <span className="text-sm sm:text-base font-semibold text-gray-900">
            {title}
          </span>
        </div>

        {/* Search pill */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="hidden sm:flex items-center flex-1 justify-center"
        >
          <div className="flex items-center w-full max-w-xl rounded-full border border-gray-200 bg-gray-50/60 shadow-inner">
            <div className="flex items-center px-3">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses, users, or reports..."
              className="w-full bg-transparent placeholder:text-gray-400 text-sm py-2.5 pr-3 outline-none"
              aria-label="Search"
            />
            <div className="h-6 w-px bg-gray-200" />
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative p-2.5 hover:bg-white rounded-full transition"
              aria-label="Notifications"
              title="Notifications"
            >
              <MdNotificationsNone className="h-5 w-5 text-gray-500" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none px-1">
                  {notifications > 9 ? "9+" : notifications}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onSettingsClick}
              className="p-2.5 hover:bg-white rounded-full transition"
              aria-label="Settings"
              title="Settings"
            >
              <MdSettings className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </form>

        {/* Avatar */}
        <button
          onClick={onProfileClick}
          className="ml-auto shrink-0 rounded-full overflow-hidden h-8 w-8 border border-gray-200 hover:ring-2 hover:ring-gray-200 transition"
          aria-label="Open profile"
          title="Profile"
        >
          <img src="public/profile.png" alt="User avatar" className="h-full w-full object-cover" />
        </button>
      </div>
    </header>
  );
}
