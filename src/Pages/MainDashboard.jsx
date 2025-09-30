import React from "react";
import StatsOverview from "../Components/dashboard/stats/StatsOverview";
import OperationalInsights from "../Components/dashboard/sections/OperationalInsights";
import CoursePerformance from "../Components/dashboard/sections/CoursePerformance";
import SystemUtilities from "../Components/dashboard/sections/SystemUtilities";
import { courses } from "../Data/courses";
import { activityFeed } from "../Data/activity";
import { dashboardStats } from "../Data/dashboardStats";
import { revenueByMonth, registrationsByMonth } from "../Data/insights";
import { alerts, quickActions } from "../Data/system";
import Footer from "../layouts/Footer";

export default function MainDashboard() {
  return (
    <div className="space-y-6">
      <StatsOverview stats={dashboardStats} />
      <OperationalInsights
        revenue={revenueByMonth}
        registrations={registrationsByMonth}
      />
      <CoursePerformance courses={courses} activity={activityFeed} />
      <SystemUtilities alerts={alerts} actions={quickActions} />
      <Footer />
    </div>
  );
}
