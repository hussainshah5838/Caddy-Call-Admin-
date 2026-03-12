import React from "react";
import { useNavigate } from "react-router-dom";
import CourseUpsertForm from "../Components/courses/forms/CourseUpsertForm";
import useCourses from "../hooks/useCourses";

function toAvatar(name = "Admin", id = "") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E5E7EB&color=111827&size=64&rounded=true&seed=${encodeURIComponent(id)}`;
}

export default function CourseAdminCoursesAdd() {
  const nav = useNavigate();
  const C = useCourses();
  const [adminOptions, setAdminOptions] = React.useState([]);

  React.useEffect(() => {
    setAdminOptions([
      { id: "ca-1", name: "Course Admin", avatar: toAvatar("Course Admin", "ca-1") },
      { id: "k-1", name: "Kitchen Staff", avatar: toAvatar("Kitchen Staff", "k-1") },
      { id: "b-1", name: "Beverage Cart Staff", avatar: toAvatar("Beverage Cart Staff", "b-1") },
    ]);
  }, []);

  return (
    <div>
      <CourseUpsertForm
        mode="create"
        adminOptions={adminOptions}
        onCancel={() => nav("/course-admin/courses")}
        onSubmit={(payload) => {
          C.create({
            name: payload?.name || "New Course",
            location: payload?.location || "",
            status:
              String(payload?.status || "").toLowerCase() === "maintenance"
                ? "maintenance"
                : "active",
            hours:
              payload?.hoursFrom && payload?.hoursTo
                ? `${payload.hoursFrom} - ${payload.hoursTo}`
                : payload?.hours || "-",
            admins: payload?.admins || [],
            mapUrl: payload?.map || "#",
            photo: typeof payload?.photo === "string" ? payload.photo : "",
            dueDate: payload?.dueDate || "",
            taxRate: payload?.taxRate ?? "",
            deliveryFee: payload?.deliveryFee ?? "",
            holes: payload?.holes || [],
            order: C.rows.length + 1,
          });
          nav("/course-admin/courses");
        }}
      />
    </div>
  );
}
