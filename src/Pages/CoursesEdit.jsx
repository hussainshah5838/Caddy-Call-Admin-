import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCourses from "../hooks/useCourses";
import CourseUpsertForm from "../Components/courses/forms/CourseUpsertForm";

// Ensure images resolve correctly under non-root deployments
const BASE = import.meta.env.BASE_URL || "/";
const admins = [
  { id: "u1", name: "Ava", avatar: `${BASE}images/admin/a1.jpg` },
  { id: "u2", name: "Ben", avatar: `${BASE}images/admin/a2.jpg` },
  { id: "u3", name: "Cara", avatar: `${BASE}images/admin/a3.jpg` },
  { id: "u4", name: "Dan", avatar: `${BASE}images/admin/a4.jpg` },
];

export default function CoursesEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const C = useCourses();
  const existing = C.getById(id);

  if (!existing) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Course not found.</p>
        <button onClick={() => nav("/courses")} className="mt-3 rounded-md border px-3 py-1.5 text-sm">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <CourseUpsertForm
      mode="edit"
      value={existing}
      adminOptions={admins}
      onCancel={() => nav("/courses")}
      onSubmit={(payload) => {
        C.update(existing.id, payload);
        nav("/courses");
      }}
    />
  );
}
