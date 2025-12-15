"use client";

import { ArrowLeft, ChartLine, Time, UserMultiple } from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getIndividualAnalytics } from "@/app/actions";
import { Loading, MetricsCard } from "@/app/components";
import Button from "@/app/components/Button/Button";
import type { IndividualAnalyticsProps } from "@/types/analytics.types";

export default function IndividualAnalytics({
  initialData,
  userId,
}: IndividualAnalyticsProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [weeksToShow] = useState(4);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const newData = await getIndividualAnalytics(userId, weeksToShow);
        if (newData) {
          setData(newData);
        }
      } catch (error) {
        console.error("Error fetching individual analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, weeksToShow]);

  return (
    <div className="w-full bg-[#f4f4f4] min-h-screen">
      <Loading active={isLoading} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ArrowLeft}
            onClick={() => router.push("/analytics")}
            className="mb-4"
          >
            Back to Analytics
          </Button>
          <h1 className="text-3xl font-semibold text-[#161616]">
            {data.user.name}
          </h1>
          <p className="text-[#525252] mt-2">{data.user.email}</p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricsCard
            title="Forecast Utilization"
            value={`${data.summary.forecastUtilization}%`}
            icon={<UserMultiple size={24} />}
            color="blue"
            subtitle="Next 4 weeks"
          />
          <MetricsCard
            title="Actual Utilization"
            value={`${data.summary.actualUtilization}%`}
            icon={<UserMultiple size={24} />}
            color="green"
            subtitle="Last 4 weeks"
          />
          <MetricsCard
            title="Forecast Hours"
            value={`${data.summary.forecastHours}h`}
            icon={<Time size={24} />}
            color="dark"
            subtitle={`${data.summary.forecastBillableHours}h billable`}
          />
          <MetricsCard
            title="Forecast Compliance"
            value={`${data.summary.forecastCompliance}%`}
            icon={<ChartLine size={24} />}
            color="purple"
            subtitle="Accuracy vs actuals"
          />
        </div>

        {/* Forecast Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-[#e0e0e0]">
            <h2 className="text-xl font-semibold text-[#161616]">
              Upcoming Forecast
            </h2>
            <p className="text-sm text-[#525252] mt-1">
              Planned hours for the next {data.weeklyData.futureWeeks.length}{" "}
              weeks
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f4f4f4]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Billable Hours
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e0e0e0]">
                {data.weeklyData.futureWeeks.map((week) => {
                  const utilization = (week.forecastHours / 40) * 100;
                  return (
                    <tr key={week.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#161616]">
                          {week.label}
                        </div>
                        <div className="text-sm text-[#525252]">
                          {new Date(week.week_ending).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#161616]">
                          {week.forecastHours}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#24a148]">
                          {week.forecastBillableHours}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#0f62fe]">
                          {utilization.toFixed(0)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical Performance */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-[#e0e0e0]">
            <h2 className="text-xl font-semibold text-[#161616]">
              Historical Performance
            </h2>
            <p className="text-sm text-[#525252] mt-1">
              Actual hours worked in the last{" "}
              {data.weeklyData.historicalWeeks.length} weeks
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f4f4f4]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Billable Hours
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e0e0e0]">
                {data.weeklyData.historicalWeeks.map((week) => {
                  const utilization = (week.actualHours / 40) * 100;
                  return (
                    <tr key={week.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#161616]">
                          {week.label}
                        </div>
                        <div className="text-sm text-[#525252]">
                          {new Date(week.week_ending).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#161616]">
                          {week.actualHours}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#24a148]">
                          {week.actualBillableHours}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#0f62fe]">
                          {utilization.toFixed(0)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Assignments */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e0e0e0]">
            <h2 className="text-xl font-semibold text-[#161616]">
              Project Assignments
            </h2>
            <p className="text-sm text-[#525252] mt-1">
              Upcoming forecast hours by project
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f4f4f4]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                    % of Capacity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e0e0e0]">
                {data.projectAssignments.map((project) => {
                  const percentage =
                    data.summary.forecastHours > 0
                      ? (project.totalHours / data.summary.forecastHours) * 100
                      : 0;
                  return (
                    <tr key={project.projectId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#161616]">
                          {project.projectName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#161616]">
                          {project.totalHours}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-[#0f62fe]">
                          {percentage.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.projectAssignments.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-[#525252]">No project assignments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
