// Monthly revenue (12 months, mock data by year)
export const revenueByYear = {
  2024: [
    { month: "Jan", revenue: 3800 },
    { month: "Feb", revenue: 3400 },
    { month: "Mar", revenue: 4200 },
    { month: "Apr", revenue: 4600 },
    { month: "May", revenue: 5100 },
    { month: "Jun", revenue: 5400 },
    { month: "Jul", revenue: 5900 },
    { month: "Aug", revenue: 6100 },
    { month: "Sep", revenue: 6300 },
    { month: "Oct", revenue: 6200 },
    { month: "Nov", revenue: 6700 },
    { month: "Dec", revenue: 7200 },
  ],
  2025: [
    { month: "Jan", revenue: 4100 },
    { month: "Feb", revenue: 3600 },
    { month: "Mar", revenue: 4800 },
    { month: "Apr", revenue: 5000 },
    { month: "May", revenue: 5600 },
    { month: "Jun", revenue: 5900 },
    { month: "Jul", revenue: 6400 },
    { month: "Aug", revenue: 6800 },
    { month: "Sep", revenue: 7000 },
    { month: "Oct", revenue: 6900 },
    { month: "Nov", revenue: 7300 },
    { month: "Dec", revenue: 7800 },
  ],
  2026: [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 5600 },
    { month: "Jul", revenue: 6300 },
    { month: "Aug", revenue: 7000 },
    { month: "Sep", revenue: 0 },
    { month: "Oct", revenue: 0 },
    { month: "Nov", revenue: 0 },
    { month: "Dec", revenue: 0 },
  ],
};

// Backward-compatible export
export const revenueByMonth = revenueByYear[2026];

// New registrations by role (last 6 months)
export const registrationsByMonth = [
  { month: "Jan", golfers: 150, staff: 20 },
  { month: "Feb", golfers: 180, staff: 18 },
  { month: "Mar", golfers: 200, staff: 22 },
  { month: "Apr", golfers: 185, staff: 25 },
  { month: "May", golfers: 220, staff: 28 },
  { month: "Jun", golfers: 210, staff: 27 },
];
