import React from "react";
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import { useAuth } from "../context/AuthContext.jsx";
import UserToolbar from "../Components/users/UserToolbar";
import UsersTable from "../Components/users/UsersTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
  const [credentialError, setCredentialError] = React.useState("");
  const [credentialsModalOpen, setCredentialsModalOpen] = React.useState(false);
  const [viewCredentials, setViewCredentials] = React.useState({ email: "", password: "" });
  const [copied, setCopied] = React.useState(false);

  // pagination (client-side)
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const getStaffRoleKey = React.useCallback((row) => {
    const roles = Array.isArray(row?.roles) ? row.roles : [];
    if (roles.some((role) => String(role).toLowerCase().includes("kitchen"))) return "kitchen";
    if (roles.some((role) => String(role).toLowerCase().includes("beverage cart"))) return "bevcart";
    if (roles.some((role) => String(role).toLowerCase().includes("pro shop"))) return "proshop";
    if (roles.some((role) => String(role).toLowerCase() === "runner")) return "runner";
    if (roles.some((role) => String(role).toLowerCase().includes("bar"))) return "bar";
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

  const handleViewCredentials = React.useCallback(async (targetUser) => {
    const token = localStorage.getItem("auth:token");
    if (!token || !targetUser?.id) {
      setCredentialError("Unable to fetch credentials.");
      return;
    }

    setCredentialError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users/${targetUser.id}/credentials`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success || !data?.credentials) {
        throw new Error(data?.message || "Credentials are not available for this user.");
      }

      setViewCredentials({
        email: data.credentials.email || "",
        password: data.credentials.password || "",
      });
      setCopied(false);
      setCredentialsModalOpen(true);
      U.refresh();
    } catch (err) {
      setCredentialError(err?.message || "Credentials are not available for this user.");
      U.refresh();
    }
  }, [U]);

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

      {(U.error || credentialError) && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {U.error || credentialError}
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
        onViewCredentials={handleViewCredentials}
        onToggleStatus={(id, currentStatus) => U.toggleStatus(id, currentStatus)}
        onDelete={(userOrId) =>
          U.remove(
            typeof userOrId === "string" ? userOrId : userOrId?.id
          )
        }
      />

      {credentialsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Login Credentials</h3>
            <p className="mt-1 text-sm text-gray-600">
              These credentials are available until the user changes password.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                  {viewCredentials.email || "-"}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Password</p>
                <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                  {viewCredentials.password || "-"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `Email: ${viewCredentials.email || ""}\nPassword: ${viewCredentials.password || ""}`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                className="rounded-md bg-[#0d3b2e] px-3 py-1.5 text-sm text-white"
                onClick={() => {
                  setCredentialsModalOpen(false);
                  setViewCredentials({ email: "", password: "" });
                  setCopied(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
