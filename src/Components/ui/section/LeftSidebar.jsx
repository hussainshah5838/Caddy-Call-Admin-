import {
  MdDashboard,
  MdPeople,
  MdSettings,
  MdPerson,
  MdNotifications,
  MdBarChart,
  MdGolfCourse,
  MdLogout,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import React, { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { hasAccess } from "../../../routes/RequireAccess.jsx";

const NAV = [
  { icon: MdDashboard, label: "Dashboard", path: "/" },
  { icon: MdGolfCourse, label: "Courses", path: "/courses", kinds: ["admin", "staff"] },
  { icon: MdPeople, label: "Users", path: "/users", kinds: ["admin"] },
  {
    icon: MdBarChart,
    label: "Menu Management",
    path: "/menu",
    kinds: ["admin", "staff"],
    roles: ["Course Admin", "Kitchen Staff"],
  },
  {
    icon: MdNotifications,
    label: "Notifications",
    path: "/notifications",
    badge: 9,
  },
  { icon: MdSettings, label: "Settings", path: "/settings", kinds: ["admin"] },
];

export default function LeftSidebar({ isOpen, setIsOpen }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const isActive = (p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p);

  const handleLogout = () => {
    logout();
  };

  const filteredNav = useMemo(() => {
    if (!user) return [];
    return NAV.filter((item) => hasAccess(user, item.kinds, item.roles));
  }, [user]);

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
              to="/account"
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
