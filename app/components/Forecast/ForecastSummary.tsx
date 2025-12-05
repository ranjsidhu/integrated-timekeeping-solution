"use client";

import { ChartLine, Time } from "@carbon/icons-react";
import type { ForecastEntry } from "@/types/forecast.types";
import type { WeekEnding } from "@/types/timesheet.types";

type ForecastSummaryProps = {
  forecastEntries: ForecastEntry[];
  weekEndings: WeekEnding[];
};

export default function ForecastSummary({
  forecastEntries,
  weekEndings,
}: ForecastSummaryProps) {
  // Only calculate for first 12 weeks
  const displayWeeks = weekEndings.slice(0, 12);
  const displayWeekIds = new Set(displayWeeks.map((w) => w.id));

  // Calculate total hours only from the first 12 weeks
  const totalHours = forecastEntries.reduce((sum, entry) => {
    const entryTotal = Object.entries(entry.weekly_hours || {}).reduce(
      (entrySum, [weekIdStr, hours]) => {
        const weekId = Number(weekIdStr);
        // Only count hours from the first 12 weeks
        if (displayWeekIds.has(weekId)) {
          return entrySum + hours;
        }
        return entrySum;
      },
      0,
    );
    return sum + entryTotal;
  }, 0);

  // Calculate billable hours only from the first 12 weeks
  const totalBillableHours = forecastEntries.reduce((sum, entry) => {
    if (entry.category_name === "Billable") {
      const entryTotal = Object.entries(entry.weekly_hours || {}).reduce(
        (entrySum, [weekIdStr, hours]) => {
          const weekId = Number(weekIdStr);
          // Only count hours from the first 12 weeks
          if (displayWeekIds.has(weekId)) {
            return entrySum + hours;
          }
          return entrySum;
        },
        0,
      );
      return sum + entryTotal;
    }
    return sum;
  }, 0);

  const activeProjects = new Set(forecastEntries.map((e) => e.project_id)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Hours Card */}
      <div className="bg-[#0f62fe] rounded-lg p-6 text-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <Time size={24} />
          </div>
        </div>
        <div className="text-3xl font-semibold mb-1">{totalHours}h</div>
        <div className="text-blue-100 text-sm">
          Total Planned Hours (Next 12 Weeks)
        </div>
      </div>

      {/* Active Projects Card */}
      <div className="bg-[#161616] rounded-lg p-6 text-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <ChartLine size={24} />
          </div>
        </div>
        <div className="text-3xl font-semibold mb-1">{activeProjects}</div>
        <div className="text-slate-300 text-sm">Active Assignments</div>
      </div>

      {/* Billable Hours Card */}
      <div className="bg-[#24a148] rounded-lg p-6 text-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <Time size={24} />
          </div>
        </div>
        <div className="text-3xl font-semibold mb-1">{totalBillableHours}h</div>
        <div className="text-green-100 text-sm">
          Total Billable Hours (Next 12 Weeks)
        </div>
      </div>

      {/* Billable Utilisation Percentage Card */}
      <div className="bg-[#8a3ffc] rounded-lg p-6 text-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <ChartLine size={24} />
          </div>
        </div>
        <div className="text-3xl font-semibold mb-1">
          {totalHours > 0
            ? ((totalBillableHours / totalHours) * 100).toFixed(1)
            : "0"}
          %
        </div>
        <div className="text-purple-100 text-sm">
          Billable Utilisation Forecast
        </div>
      </div>
    </div>
  );
}
