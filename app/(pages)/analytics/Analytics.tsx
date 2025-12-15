"use client";

import {
  ChartLine,
  CheckmarkFilled,
  Time,
  UserMultiple,
} from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAnalyticsMetrics,
  getForecastVsActuals,
  getProjectAnalytics,
  getTeamUtilization,
} from "@/app/actions";
import {
  AnalyticsFilters,
  ForecastVsActualsChart,
  Loading,
  MetricsCard,
  ProjectAnalyticsTable,
  TeamCapacityTable,
  UtilizationTrendChart,
} from "@/app/components";
import type { AnalyticsPageProps } from "@/types/analytics.types";

export default function AnalyticsPage({
  initialMetrics,
  initialTeamMembers,
  initialWeekEndings,
  initialForecastVsActuals,
  initialProjects,
}: AnalyticsPageProps) {
  const router = useRouter();
  const [weeksToShow, setWeeksToShow] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  const [metrics, setMetrics] = useState(initialMetrics);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [weekEndings, setWeekEndings] = useState(initialWeekEndings);
  const [forecastVsActuals, setForecastVsActuals] = useState(
    initialForecastVsActuals,
  );
  const [projects, setProjects] = useState(initialProjects);

  // Fetch data when weeks filter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [newMetrics, newUtilization, newForecastVsActuals, newProjects] =
          await Promise.all([
            getAnalyticsMetrics(weeksToShow),
            getTeamUtilization(weeksToShow),
            getForecastVsActuals(weeksToShow),
            getProjectAnalytics(weeksToShow),
          ]);

        setMetrics(newMetrics);
        setTeamMembers(newUtilization.teamMembers);
        setWeekEndings(newUtilization.weekEndings);
        setForecastVsActuals(newForecastVsActuals);
        setProjects(newProjects);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [weeksToShow]);

  const handleWeeksChange = (weeks: number) => {
    setWeeksToShow(weeks);
  };

  const handleMemberClick = (userId: number) => {
    router.push(`/analytics/${userId}`);
  };

  return (
    <div className="w-full bg-[#f4f4f4] min-h-screen">
      <Loading active={isLoading} />

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

        {/* Filters */}
        <AnalyticsFilters
          weeksToShow={weeksToShow}
          onWeeksChange={handleWeeksChange}
        />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricsCard
            title="Team Utilization"
            value={`${metrics.teamUtilization}%`}
            icon={<UserMultiple size={24} />}
            color="blue"
            subtitle={`Next ${weeksToShow} weeks average`}
          />
          <MetricsCard
            title="Total Billable Hours"
            value={`${metrics.totalBillableHours}h`}
            icon={<Time size={24} />}
            color="green"
            subtitle={`Next ${weeksToShow} weeks forecast`}
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Utilization Trend Chart */}
          <UtilizationTrendChart
            teamMembers={teamMembers}
            weekEndings={weekEndings}
          />

          {/* Forecast vs Actuals Chart */}
          <ForecastVsActualsChart
            weekEndings={forecastVsActuals.weekEndings}
            forecastHours={forecastVsActuals.forecastHours}
            actualHours={forecastVsActuals.actualHours}
            variance={forecastVsActuals.variance}
          />
        </div>

        {/* Project Analytics Table */}
        <div className="mb-8">
          <ProjectAnalyticsTable projects={projects} />
        </div>

        {/* Team Capacity Table */}
        <TeamCapacityTable
          teamMembers={teamMembers}
          weekEndings={weekEndings}
          onMemberClick={handleMemberClick}
        />
      </div>
    </div>
  );
}
