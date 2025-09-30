import { createBrowserRouter, Outlet } from "react-router-dom";
import React from "react";

// Layout
import DashboardLayout from "../layouts/SiteLayout";

// Pages
import DashboardContent from "../Pages/MainDashboard";
import CoursesPage from "../Pages/CoursesPage";
import CoursesAdd from "../Pages/CoursesAdd";
import CoursesEdit from "../Pages/CoursesEdit";

import UsersPage from "../Pages/UsersPage";
import UsersAdd from "../Pages/UsersAdd";
import UsersEdit from "../Pages/UsersEdit";

import MenuManagementPage from "../Pages/MenuManagementPage";
import NotificationsPage from "../Pages/NotificationsPage";
import SettingsPage from "../Pages/SettingsPage";
import AccountPage from "../Pages/AccountPage";

import LoginPage from "../Pages/Auth/Login";
import ProfilePage from "../Pages/ProfilePage";
import MessagesPage from "../Pages/MessagesPage";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardContent /> },
      {
        path: "courses",
        children: [
          { index: true, element: <CoursesPage /> },
          { path: "new", element: <CoursesAdd /> },
          { path: ":id/edit", element: <CoursesEdit /> },
        ],
      },
      {
        path: "users",
        children: [
          { index: true, element: <UsersPage /> }, 
          { path: "new", element: <UsersAdd /> }, 
          { path: ":id/edit", element: <UsersEdit /> },
        ],
      },
      { path: "menu", element: <MenuManagementPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "profile/*", element: <ProfilePage /> },
      { path: "messages/*", element: <MessagesPage /> },
    ],
  },
  {
    path: "/auth",
    element: <Outlet />,
    children: [{ path: "login", element: <LoginPage /> }],
  },
]);

export default Router;
