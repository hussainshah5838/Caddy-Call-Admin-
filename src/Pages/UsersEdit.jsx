import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import UserUpsertForm from "../Components/users/UserUpsertForm";

export default function UsersEdit() {
  const { id } = useParams();
  const U = useUsers();
  const nav = useNavigate();
  const existing = U.getById(id);

  if (!existing) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">User not found.</p>
        <button
          onClick={() => nav("/users")}
          className="mt-3 rounded-md border px-3 py-1.5 text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <UserUpsertForm
      mode="edit"
      value={{
        photo: existing.avatar,
        email: existing.email,
        course: existing.course,
        role: existing.roles[0] || "Admin",
        status: existing.status,
        lastActivity: existing.lastActivity,
      }}
      courseOptions={U.courses.filter((c) => c !== "all")}
      onCancel={() => nav("/users")}
      onSubmit={(payload) => {
        U.update(existing.id, {
          email: payload.email,
          course: payload.course,
          roles: [payload.role],
          status: payload.status,
          lastActivity: payload.lastActivity,
        });
        nav("/users");
      }}
    />
  );
}
