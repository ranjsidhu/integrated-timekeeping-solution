"use client";

import { ChartLine, Time } from "@carbon/icons-react";
import type { ForecastEntry } from "@/types/forecast.types";

type ForecastSummaryProps = {
  forecastEntries: ForecastEntry[];
};

export default function ForecastSummary({
  forecastEntries,
}: ForecastSummaryProps) {
  // Calculate total hours from actual weekly breakdowns, not weekEndings.length
  const totalHours = forecastEntries.reduce((sum, entry) => {
    // Sum up the actual hours from weekly_hours
    const entryTotal = Object.values(entry.weekly_hours || {}).reduce(
      (entrySum, hours) => entrySum + hours,
      0,
    );
    return sum + entryTotal;
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
        <div className="text-blue-100 text-sm">Total Planned Hours</div>
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
    </div>
  );
}
