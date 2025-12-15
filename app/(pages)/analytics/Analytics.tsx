"use client";

import {
  ChartLine,
  CheckmarkFilled,
  Time,
  UserMultiple,
} from "@carbon/icons-react";
import { MetricsCard, TeamCapacityTable } from "@/app/components";
import type { AnalyticsPageProps } from "@/types/analytics.types";

export default function AnalyticsPage({
  metrics,
  teamMembers,
  weekEndings,
}: AnalyticsPageProps) {
  return (
    <div className="w-full bg-[#f4f4f4] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#161616]">
            Analytics Dashboard
          </h1>
          <p className="text-[#525252] mt-2">
            Team capacity and utilization insights
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricsCard
            title="Team Utilization"
            value={`${metrics.teamUtilization}%`}
            icon={<UserMultiple size={24} />}
            color="blue"
            subtitle="Next 4 weeks average"
          />
          <MetricsCard
            title="Total Billable Hours"
            value={`${metrics.totalBillableHours}h`}
            icon={<Time size={24} />}
            color="green"
            subtitle="Next 4 weeks forecast"
          />
          <MetricsCard
            title="Active Assignments"
            value={metrics.activeAssignments}
            icon={<ChartLine size={24} />}
            color="dark"
            subtitle="Across all team members"
          />
          <MetricsCard
            title="Forecast Compliance"
            value={`${metrics.forecastCompliance}%`}
            icon={<CheckmarkFilled size={24} />}
            color="purple"
            subtitle="Forecast accuracy"
          />
        </div>

        {/* Team Capacity Table */}
        <TeamCapacityTable
          teamMembers={teamMembers}
          weekEndings={weekEndings}
        />
      </div>
    </div>
  );
}
