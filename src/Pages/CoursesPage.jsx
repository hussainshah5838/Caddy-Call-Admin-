import React from "react";
import { useNavigate } from "react-router-dom";
import useCourses from "../hooks/useCourses";
import CoursesFilterBar from "../Components/courses/coursesTable/CoursesFilterBar";
import CoursesTable from "../Components/courses/coursesTable/CoursesTable";
import ConfirmModal from "../Components/ui/shared/ConfirmModal";
import CoursesStats from "../Components/courses/sections/CoursesStats";
import { coursesStats } from "../Data/coursesStats";

const CoursesPage = () => {
  const C = useCourses();
  const nav = useNavigate();
  const [confirm, setConfirm] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const total = C.filtered.length;
  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return C.filtered.slice(start, start + pageSize);
  }, [C.filtered, page]);

  return (
    <div className="space-y-4">
      <CoursesStats stats={coursesStats} />

      <CoursesFilterBar
        query={C.query}
        setQuery={C.setQuery}
        status={C.status}
        setStatus={C.setStatus}
        sort={C.sort}
        setSort={C.setSort}
        onAdd={() => nav("/courses/new")} // route to full-page Add form
      />

      <h2 className="text-lg font-semibold text-gray-900">
        Manage Club Courses
      </h2>

      <CoursesTable
        rows={pagedRows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onToggle={C.toggleStatus}
        onEdit={(course) => nav(`/courses/${course.id}/edit`)}
        onDelete={(course) => setConfirm(course)}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!confirm}
        title="Delete Course"
        body={`Are you sure you want to delete “${confirm?.name}”? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => C.remove(confirm.id)}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
};

export default CoursesPage;
