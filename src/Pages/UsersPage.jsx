import React from "react";
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import UserToolbar from "../Components/users/UserToolbar";
import UsersTable from "../Components/users/UsersTable";

export default function UsersPage() {
  const U = useUsers();
  const nav = useNavigate();

  // pagination (client-side)
  const [page, setPage] = React.useState(1);
  const pageSize = 6;
  const total = U.filtered.length;

  const rows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return U.filtered.slice(start, start + pageSize);
  }, [U.filtered, page]);

  const pageRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return U.filtered.slice(start, start + pageSize);
  }, [U.filtered, page]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">
          Manage all users registered on the Golf Platform, including golfers
          and staff members.
        </p>
      </div>

      <UserToolbar
        counts={U.counts}
        tab={U.tab}
        setTab={U.setTab}
        query={U.query}
        setQuery={U.setQuery}
        course={U.course}
        setCourse={U.setCourse}
        courseOptions={U.courses}
        status={U.status}
        setStatus={U.setStatus}
        onAdd={() => nav("/users/new")}
      />

      <UsersTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onEdit={(user) => nav(`/users/${user.id}/edit`)}
        onDelete={(user) => U.remove(user.id)}
      />
    </div>
  );
}
