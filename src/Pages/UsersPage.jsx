import React from "react";
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import { useAuth } from "../context/AuthContext.jsx";
import UserToolbar from "../Components/users/UserToolbar";
import UsersTable from "../Components/users/UsersTable";

export default function UsersPage() {
  const { user } = useAuth();
  const isCourseAdmin = String(user?.backendRole || "").toLowerCase() === "course admin";
  const courseAdminRequestParams = React.useMemo(
    () =>
      isCourseAdmin
        ? {
            role: "Staff",
            course: user?.course || "",
          }
        : {},
    [isCourseAdmin, user?.course]
  );
  const U = useUsers({ remote: true, requestParams: courseAdminRequestParams });
  const nav = useNavigate();
  const [staffTab, setStaffTab] = React.useState("allStaff");

  // pagination (client-side)
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const getStaffRoleKey = React.useCallback((row) => {
    const role = String(row?.roles?.[0] || "").toLowerCase();
    if (role.includes("kitchen")) return "kitchen";
    if (role.includes("beverage cart")) return "bevcart";
    if (role.includes("pro shop")) return "proshop";
    if (role === "runner") return "runner";
    if (role.includes("bar")) return "bar";
    return null;
  }, []);

  const staffRows = React.useMemo(() => {
    if (!isCourseAdmin) return [];
    let out = U.rows.filter((r) => getStaffRoleKey(r));

    if (staffTab !== "allStaff") {
      out = out.filter((r) => getStaffRoleKey(r) === staffTab);
    }

    if (U.query.trim()) {
      const q = U.query.toLowerCase();
      out = out.filter(
        (r) =>
          String(r?.name || "").toLowerCase().includes(q) ||
          String(r?.email || "").toLowerCase().includes(q)
      );
    }

    if (U.status !== "all") {
      out = out.filter((r) => r.status === U.status);
    }

    return out;
  }, [U.rows, U.query, U.status, isCourseAdmin, staffTab, getStaffRoleKey]);

  const total = isCourseAdmin ? staffRows.length : U.filtered.length;

  const rows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    const source = isCourseAdmin ? staffRows : U.filtered;
    return source.slice(start, start + pageSize);
  }, [U.filtered, page, isCourseAdmin, staffRows]);

  const staffCounts = React.useMemo(() => {
    if (!isCourseAdmin) return null;
    return {
      allStaff: U.rows.filter((r) => getStaffRoleKey(r)).length,
      kitchen: U.rows.filter((r) => getStaffRoleKey(r) === "kitchen").length,
      bevcart: U.rows.filter((r) => getStaffRoleKey(r) === "bevcart").length,
      proshop: U.rows.filter((r) => getStaffRoleKey(r) === "proshop").length,
      runner: U.rows.filter((r) => getStaffRoleKey(r) === "runner").length,
      bar: U.rows.filter((r) => getStaffRoleKey(r) === "bar").length,
    };
  }, [U.rows, isCourseAdmin, getStaffRoleKey]);

  const staffTabs = React.useMemo(() => {
    if (!staffCounts) return [];
    return [
      { id: "allStaff", label: "All Staff", count: staffCounts.allStaff },
      { id: "kitchen", label: "Kitchen", count: staffCounts.kitchen },
      { id: "bevcart", label: "Bev Cart", count: staffCounts.bevcart },
      { id: "proshop", label: "Pro Shop", count: staffCounts.proshop },
      { id: "runner", label: "Runner", count: staffCounts.runner },
      { id: "bar", label: "Bar", count: staffCounts.bar },
    ];
  }, [staffCounts]);

  React.useEffect(() => {
    setPage(1);
  }, [U.tab, U.query, U.course, U.status, staffTab]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {isCourseAdmin ? "Staff Management" : "User Management"}
        </h1>
        <p className="text-sm text-gray-500">
          {isCourseAdmin
            ? "Manage all staff members registered on the Golf Platform of your course."
            : "Manage all users registered on the Golf Platform, including golfers and staff members."}
        </p>
      </div>

      <UserToolbar
        counts={isCourseAdmin ? {} : U.counts}
        tab={isCourseAdmin ? staffTab : U.tab}
        setTab={isCourseAdmin ? setStaffTab : U.setTab}
        tabs={isCourseAdmin ? staffTabs : undefined}
        query={U.query}
        setQuery={U.setQuery}
        course={U.course}
        setCourse={U.setCourse}
        courseOptions={U.courses}
        showCourseFilter={!isCourseAdmin}
        status={U.status}
        setStatus={U.setStatus}
        onAdd={() => nav("/users/new")}
      />

      {U.error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {U.error}
        </div>
      )}

      <UsersTable
        rows={rows}
        loading={U.loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        showCourseColumn={!isCourseAdmin}
        onEdit={(user) => nav(`/users/${user.id}/edit`)}
        onToggleStatus={(id, currentStatus) => U.toggleStatus(id, currentStatus)}
        onDelete={(userOrId) =>
          U.remove(
            typeof userOrId === "string" ? userOrId : userOrId?.id
          )
        }
      />
    </div>
  );
}
