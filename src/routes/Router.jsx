import { createBrowserRouter, Outlet } from "react-router-dom";

// Layout
import DashboardLayout from "../layouts/SiteLayout";
import RequireAuth from "./RequireAuth";
import RequireAccess from "./RequireAccess";

// Pages
import DashboardContent from "../Pages/MainDashboard";
import CoursesPage from "../Pages/CoursesPage";
import CoursesAdd from "../Pages/CoursesAdd";
import CoursesEdit from "../Pages/CoursesEdit";

import UsersPage from "../Pages/UsersPage";
import UsersAdd from "../Pages/UsersAdd";
import UsersEdit from "../Pages/UsersEdit";

import MenuManagementPage from "../Pages/MenuManagementPage";
import MenuListPage from "../Pages/MenuListPage";
import NotificationsPage from "../Pages/NotificationsPage";
import SettingsPage from "../Pages/SettingsPage";
import AccountPage from "../Pages/AccountPage";

import LoginPage from "../Pages/Auth/Login";
import ProfilePage from "../Pages/ProfilePage";
import MessagesPage from "../Pages/MessagesPage";

const Router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardContent /> },
      {
        path: "courses",
        children: [
          {
            index: true,
            element: (
              <RequireAccess kinds={["admin", "staff"]}>
                <CoursesPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess kinds={["admin", "staff"]}>
                <CoursesAdd />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess kinds={["admin", "staff"]}>
                <CoursesEdit />
              </RequireAccess>
            ),
          },
        ],
      },
      {
        path: "users",
        children: [
          {
            index: true,
            element: (
              <RequireAccess kinds={["admin"]}>
                <UsersPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess kinds={["admin"]}>
                <UsersAdd />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess kinds={["admin"]}>
                <UsersEdit />
              </RequireAccess>
            ),
          },
        ],
      },
      {
        path: "/menu",
        element: <MenuListPage />, 
      },
      {
        path: "menu/:id",
        element: (
          <RequireAccess
            kinds={["admin", "staff"]}
            roles={["Course Admin", "Kitchen Staff"]}
          >
            <MenuManagementPage />
          </RequireAccess>
        ),
      },
      { path: "notifications", element: <NotificationsPage /> },
      {
        path: "settings",
        element: (
          <RequireAccess kinds={["admin"]}>
            <SettingsPage />
          </RequireAccess>
        ),
      },
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
