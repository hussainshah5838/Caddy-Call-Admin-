import React from "react";
import ChartCard from "../../ui/shared/ChartCard";
import RevenueTrendChart from "../charts/RevenueTrendChart";
import RegistrationByRoleChart from "../charts/RegistrationByRoleChart";

const OperationalInsights = React.memo(function OperationalInsights({
  revenue,
  registrations,
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-800">
        Operational Insights
      </h2>

      <ChartCard
        title="Monthly Revenue Trend"
        subtitle="Overall platform revenue performance over the last 8 months."
      >
        <RevenueTrendChart data={revenue} />
      </ChartCard>

      <ChartCard
        title="User Registration by Role"
        subtitle="New user registrations distributed between golfers and staff."
      >
        <RegistrationByRoleChart data={registrations} />
      </ChartCard>
    </section>
  );
});

export default OperationalInsights;
