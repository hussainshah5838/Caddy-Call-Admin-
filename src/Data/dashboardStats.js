export const dashboardStats = [
  {
    key: "orders",
    title: "Total Orders",
    value: 1234,
    delta: +12, // % vs last month (negative for down)
    sub: "from last month",
    icon: "cart",
  },
  {
    key: "users",
    title: "Registered Users",
    value: 5678,
    delta: +8,
    sub: "total golfers & staff",
    icon: "users",
  },
  {
    key: "revenue",
    title: "Monthly Revenue",
    value: 123456,
    currency: "USD", // adds $ formatting
    delta: +15,
    sub: "vs previous month",
    icon: "money",
  },
  {
    key: "courses",
    title: "Active Golf Courses",
    value: 12,
    delta: -1, // down vs last quarter
    sub: "from last quarter",
    icon: "pin",
  },
];
