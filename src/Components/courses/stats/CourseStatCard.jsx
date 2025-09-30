import React from "react";
import { MdCheckCircle, MdAccessTime, MdGroups } from "react-icons/md";
import { PiLeafLight } from "react-icons/pi"; 

const ICONS = {
  leaf: PiLeafLight,
  check: MdCheckCircle,
  clock: MdAccessTime,
  users: MdGroups,
};

const ACCENTS = {
  lime: "bg-lime-50 text-lime-600 ring-1 ring-lime-100",
  cyan: "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100",
  violet: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
  pink: "bg-pink-50 text-pink-600 ring-1 ring-pink-100",
};

const CourseStatCard = React.memo(function CourseStatCard({
  title,
  value,
  icon = "leaf",
  accent = "lime",
}) {
  const Icon = ICONS[icon] || PiLeafLight;
  const badge = ACCENTS[accent] || ACCENTS.lime;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-600">{title}</div>
        <div
          className={`h-8 w-8 grid place-items-center rounded-full ${badge}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 text-2xl font-semibold text-gray-900 tracking-tight">
        {Number(value).toLocaleString()}
      </div>
    </div>
  );
});

export default CourseStatCard;
