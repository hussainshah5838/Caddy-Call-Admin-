export const alerts = [
  { id: 1, type: "ok", text: "All services operational." },
  {
    id: 2,
    type: "error",
    text: "Database backup overdue.",
    cta: "Action Required!",
  },
  { id: 3, type: "warn", text: "Scheduled maintenance for API on Friday." },
];

export const quickActions = [
  {
    id: "add-course",
    icon: "plus",
    label: "Add New Course",
    to: "/courses/new",
  },
  { id: "reports", icon: "chart", label: "View All Reports", to: "/reports" },
  { id: "users", icon: "users", label: "Manage Users", to: "/users" },
  {
    id: "settings",
    icon: "settings",
    label: "Platform Settings",
    to: "/settings",
  },
];
