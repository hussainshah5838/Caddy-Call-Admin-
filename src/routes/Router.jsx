import { createBrowserRouter, Outlet } from "react-router-dom";

// Layout
import DashboardLayout from "../layouts/SiteLayout";
import RequireAuth from "./RequireAuth";
import RequireAccess from "./RequireAccess";

// Pages
import RoleHome from "./RoleHome";
import CoursesPage from "../Pages/CoursesPage";
import CoursesAdd from "../Pages/CoursesAdd";
import CoursesEdit from "../Pages/CoursesEdit";
import CourseAdminDashboard from "../Pages/CourseAdminDashboard";
import CourseAdminCoursesPage from "../Pages/CourseAdminCoursesPage";
import CourseAdminCoursesAdd from "../Pages/CourseAdminCoursesAdd";
import CourseAdminCoursesEdit from "../Pages/CourseAdminCoursesEdit";

import UsersPage from "../Pages/UsersPage";
import UsersAdd from "../Pages/UsersAdd";
import UsersEdit from "../Pages/UsersEdit";
import CourseAdminStaffPage from "../Pages/CourseAdminStaffPage";
import StaffAdd from "../Pages/StaffAdd";
import StaffEdit from "../Pages/StaffEdit";

import MenuManagementPage from "../Pages/MenuManagementPage";
import MenuListPage from "../Pages/MenuListPage";
import ProShopListPage from "../Pages/ProShopListPage";
import ProShopManagementPage from "../Pages/ProShopManagementPage";
import CourseAdminMenuListPage from "../Pages/CourseAdminMenuListPage";
import CourseAdminMenuManagementPage from "../Pages/CourseAdminMenuManagementPage";
import CourseAdminProShopPage from "../Pages/CourseAdminProShopPage";
import NotificationsPage from "../Pages/NotificationsPage";
import CourseAdminNotificationsPage from "../Pages/CourseAdminNotificationsPage";
import SettingsPage from "../Pages/SettingsPage";
import CourseAdminSettingsPage from "../Pages/CourseAdminSettingsPage";
import AccountPage from "../Pages/AccountPage";
import CourseAdminAccountPage from "../Pages/CourseAdminAccountPage";

import LoginPage from "../Pages/Auth/Login";
import ForgotPasswordPage from "../Pages/Auth/ForgotPassword";
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
      { index: true, element: <RoleHome /> },
      {
        path: "course-admin",
        element: (
          <RequireAccess roles={["Course Admin"]}>
            <CourseAdminDashboard />
          </RequireAccess>
        ),
      },
      {
        path: "courses",
        children: [
          {
            index: true,
            element: (
              <RequireAccess roles={["Super Admin"]}>
                <CoursesPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess roles={["Super Admin"]}>
                <CoursesAdd />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess roles={["Super Admin"]}>
                <CoursesEdit />
              </RequireAccess>
            ),
          },
        ],
      },
      {
        path: "course-admin/courses",
        children: [
          {
            index: true,
            element: (
              <RequireAccess roles={["Course Admin"]}>
                <CourseAdminCoursesPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess roles={["Course Admin"]}>
                <CourseAdminCoursesAdd />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess roles={["Course Admin"]}>
                <CourseAdminCoursesEdit />
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
              <RequireAccess roles={["Super Admin"]}>
                <UsersPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess roles={["Super Admin"]}>
                <UsersAdd />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess roles={["Super Admin"]}>
                <UsersEdit />
              </RequireAccess>
            ),
          },
        ],
      },
      {
        path: "course-admin/staff",
        children: [
          {
            index: true,
            element: (
              <RequireAccess roles={["Course Admin"]}>
                <CourseAdminStaffPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess roles={["Course Admin"]}>
                <StaffAdd />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess roles={["Course Admin"]}>
                <StaffEdit />
              </RequireAccess>
            ),
          },
        ],
      },
      {
        path: "/menu",
        element: (
          <RequireAccess roles={["Super Admin"]}>
            <MenuListPage />
          </RequireAccess>
        ),
      },
      {
        path: "/pro-shop",
        element: (
          <RequireAccess roles={["Super Admin"]}>
            <ProShopListPage />
          </RequireAccess>
        ),
      },
      {
        path: "course-admin/menu",
        element: (
          <RequireAccess roles={["Course Admin"]}>
            <CourseAdminMenuManagementPage />
          </RequireAccess>
        ),
      },
      {
        path: "course-admin/pro-shop",
        element: (
          <RequireAccess roles={["Course Admin"]}>
            <CourseAdminProShopPage />
          </RequireAccess>
        ),
      },
      {
        path: "menu/:id",
        element: (
          <RequireAccess
            kinds={["admin", "staff"]}
            roles={["Super Admin", "Kitchen Staff"]}
          >
            <MenuManagementPage />
          </RequireAccess>
        ),
      },
      {
        path: "pro-shop/:id",
        element: (
          <RequireAccess roles={["Super Admin"]}>
            <ProShopManagementPage />
          </RequireAccess>
        ),
      },
      {
        path: "course-admin/menu/:id",
        element: (
          <RequireAccess roles={["Course Admin"]}>
            <CourseAdminMenuManagementPage />
          </RequireAccess>
        ),
      },
      {
        path: "notifications",
        element: (
          <RequireAccess roles={["Super Admin"]}>
            <NotificationsPage />
          </RequireAccess>
        ),
      },
      {
        path: "course-admin/notifications",
        element: (
          <RequireAccess roles={["Course Admin"]}>
            <CourseAdminNotificationsPage />
          </RequireAccess>
        ),
      },
      {
        path: "settings",
        element: (
          <RequireAccess roles={["Super Admin"]}>
            <SettingsPage />
          </RequireAccess>
        ),
      },
      {
        path: "course-admin/settings",
        element: (
          <RequireAccess roles={["Course Admin"]}>
            <CourseAdminSettingsPage />
          </RequireAccess>
        ),
      },
      {
        path: "account",
        element: (
          <RequireAccess roles={["Super Admin"]}>
            <AccountPage />
          </RequireAccess>
        ),
      },
      {
        path: "course-admin/account",
        element: (
          <RequireAccess roles={["Course Admin"]}>
            <CourseAdminAccountPage />
          </RequireAccess>
        ),
      },
      { path: "profile/*", element: <ProfilePage /> },
      { path: "messages/*", element: <MessagesPage /> },
    ],
  },
  {
    path: "/auth",
    element: <Outlet />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "forgot", element: <ForgotPasswordPage /> },
    ],
  },
]);

export default Router;
