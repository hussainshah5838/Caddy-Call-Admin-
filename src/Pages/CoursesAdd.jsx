import React from "react";
import { useNavigate } from "react-router-dom";
import useCourses from "../hooks/useCourses";
import CourseUpsertForm from "../Components/courses/forms/CourseUpsertForm";
const BASE = import.meta.env.BASE_URL || "/";

const admins = [
  { id: "u1", name: "Ava", avatar: `${BASE}images/admin/a1.jpg` },
  { id: "u2", name: "Ben", avatar: `${BASE}images/admin/a2.jpg` },
  { id: "u3", name: "Cara", avatar: `${BASE}images/admin/a3.jpg` },
  { id: "u4", name: "Dan", avatar: `${BASE}images/admin/a4.jpg` },
];

export default function CoursesAdd() {
  const nav = useNavigate();
  const C = useCourses();

  return (
    <CourseUpsertForm
      mode="create"
      adminOptions={admins}
      onCancel={() => nav("/courses")}
      onSubmit={(payload) => {
        C.create({ order: (C.rows[0]?.order || 0) + 1, ...payload });
        nav("/courses");
      }}
    />
  );
}
