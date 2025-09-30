import React from "react";
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import UserUpsertForm from "../Components/users/UserUpsertForm";

export default function UsersAdd() {
  const U = useUsers();
  const nav = useNavigate();

  return (
    <UserUpsertForm
      mode="create"
      courseOptions={U.courses.filter((c) => c !== "all")}
      onCancel={() => nav("/users")}
      onSubmit={(payload) => {
        U.create({
          name: payload.email.split("@")[0],
          email: payload.email,
          avatar: "/avatars/a8.jpg",
          roles: [payload.role],
          course: payload.course,
          status: payload.status,
          lastActivity:
            payload.lastActivity || new Date().toISOString().slice(0, 10),
          kind: payload.role.toLowerCase().includes("admin")
            ? "admin"
            : payload.role.toLowerCase().includes("staff")
            ? "staff"
            : "golfer",
        });
        nav("/users");
      }}
    />
  );
}
