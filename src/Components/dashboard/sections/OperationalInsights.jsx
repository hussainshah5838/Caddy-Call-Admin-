import React, { useEffect, useMemo, useState } from "react";
import ChartCard from "../../ui/shared/ChartCard";
import RevenueTrendChart from "../charts/RevenueTrendChart";
import RegistrationByRoleChart from "../charts/RegistrationByRoleChart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function buildEmptyYearRevenue() {
  return MONTHS.map((month) => ({ month, revenue: 0 }));
}

function buildEmptyYearRegistrations() {
  return MONTHS.map((month) => ({ month, golfers: 0, staff: 0 }));
}

function normalizeMonthlyRevenue(rows) {
  const lookup = new Map((rows || []).map((r) => [r.month, Number(r.revenue || 0)]));
  return MONTHS.map((month) => ({ month, revenue: lookup.get(month) || 0 }));
}

function normalizeMonthlyRegistrations(rows) {
  const lookup = new Map(
    (rows || []).map((r) => [
      r.month,
      {
        golfers: Number(r.golfers || 0),
        staff: Number(r.staff || 0),
      },
    ])
  );

  return MONTHS.map((month) => ({
    month,
    golfers: lookup.get(month)?.golfers || 0,
    staff: lookup.get(month)?.staff || 0,
  }));
}

const OperationalInsights = React.memo(function OperationalInsights({
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    // Calendar-based list: broad year range instead of data-limited years.
    const minYear = 1900;
    const maxYear = currentYear + 50;
    const years = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
      years.push(year);
    }
    return years;
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [revenueRows, setRevenueRows] = useState(buildEmptyYearRevenue());
  const [registrationRows, setRegistrationRows] = useState(buildEmptyYearRegistrations());

  useEffect(() => {
    let isMounted = true;

    const fetchRevenue = async () => {
      // Backend currently validates years in this range.
      if (selectedYear < 2020 || selectedYear > 2100) {
        if (isMounted) setRevenueRows(buildEmptyYearRevenue());
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (isMounted) setRevenueRows(buildEmptyYearRevenue());
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/super-admin/monthly-revenue?year=${selectedYear}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.monthlyRevenue)) {
          if (isMounted) setRevenueRows(buildEmptyYearRevenue());
          return;
        }

        if (isMounted) {
          setRevenueRows(normalizeMonthlyRevenue(data.monthlyRevenue));
        }
      } catch {
        if (isMounted) setRevenueRows(buildEmptyYearRevenue());
      }
    };

    fetchRevenue();

    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  useEffect(() => {
    let isMounted = true;

    const fetchRegistrations = async () => {
      // Backend currently validates years in this range.
      if (selectedYear < 2020 || selectedYear > 2100) {
        if (isMounted) setRegistrationRows(buildEmptyYearRegistrations());
        return;
      }

      const token = localStorage.getItem("auth:token");
      if (!token) {
        if (isMounted) setRegistrationRows(buildEmptyYearRegistrations());
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/super-admin/user-registrations-by-role?year=${selectedYear}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !Array.isArray(data?.monthlyData)) {
          if (isMounted) setRegistrationRows(buildEmptyYearRegistrations());
          return;
        }

        if (isMounted) {
          setRegistrationRows(normalizeMonthlyRegistrations(data.monthlyData));
        }
      } catch {
        if (isMounted) setRegistrationRows(buildEmptyYearRegistrations());
      }
    };

    fetchRegistrations();

    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-800">
        Operational Insights
      </h2>

      <ChartCard
        title="Monthly Revenue Trend"
        subtitle={`Overall platform revenue performance for ${selectedYear}.`}
        headerRight={
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <RevenueTrendChart data={revenueRows} />
      </ChartCard>

      <ChartCard
        title="User Registration by Role"
        subtitle={`New user registrations distributed between golfers and staff for ${selectedYear}.`}
        headerRight={
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <RegistrationByRoleChart data={registrationRows} />
      </ChartCard>
    </section>
  );
});

export default OperationalInsights;
