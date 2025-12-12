"use client";

import { Edit, TrashCan } from "@carbon/icons-react";
import type { ForecastTimelineProps } from "@/types/forecast.types";

export default function ForecastTimeline({
  forecastEntries,
  weekEndings,
  onEditEntry,
  onDeleteEntry,
  problemWeeks = [],
}: ForecastTimelineProps) {
  if (forecastEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <div className="text-[#8d8d8d] mb-4">
          <svg
            role="img"
            aria-label="calendar-icon"
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[#161616] mb-2">
          No entries yet
        </h3>
        <p className="text-[#525252]">
          Click "Add Entry" to start planning your hours
        </p>
      </div>
    );
  }

  // Only display first 12 weeks in the UI
  const displayWeeks = weekEndings.slice(0, 12);

  // Calculate totals per week (only for displayed weeks)
  const calculateWeekTotal = (weekId: number) => {
    return forecastEntries.reduce((sum, entry) => {
      const weekHours = entry.weekly_hours?.[weekId] || 0;
      return sum + weekHours;
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-250">
          <thead>
            <tr className="bg-[#f4f4f4] border-b border-[#e0e0e0]">
              <th className="p-4 text-left font-semibold text-xs text-[#525252] uppercase tracking-wide sticky left-0 bg-[#f4f4f4] z-20 min-w-75">
                Assignment
              </th>
              <th className="px-3 py-3 text-left font-semibold text-xs text-[#525252] uppercase tracking-wide min-w-30">
                Start Date
              </th>
              <th className="px-3 py-3 text-left font-semibold text-xs text-[#525252] uppercase tracking-wide min-w-30">
                End Date
              </th>
              <th className="px-3 py-3 text-left font-semibold text-xs text-[#525252] uppercase tracking-wide min-w-35">
                Extension
              </th>
              {displayWeeks.map((week, index) => (
                <th
                  key={week.id}
                  className={`px-2 py-3 text-center font-semibold text-xs uppercase tracking-wide min-w-17.5 ${
                    problemWeeks.includes(week.id)
                      ? "text-[#da1e28] bg-[#ffd7d9] border-l border-[#ffb3b8]"
                      : "text-[#525252]"
                  }`}
                >
                  <div>W{index + 1}</div>
                  <div className="font-normal text-[0.625rem] mt-1">
                    {new Date(week.week_ending).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-center font-semibold text-xs text-[#525252] uppercase tracking-wide sticky right-0 bg-[#f4f4f4] z-20 min-w-35">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {forecastEntries.map((entry, index) => {
              const avatarLetter =
                entry.project_name?.charAt(0).toUpperCase() || "P";
              const avatarColor =
                entry.category_name === "Holiday"
                  ? "bg-[#8a3ffc]"
                  : entry.category_name === "Training"
                    ? "bg-[#0f62fe]"
                    : "bg-[#24a148]";

              return (
                <tr
                  key={entry.id}
                  className={`border-b border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                  }`}
                >
                  {/* Assignment Info */}
                  <td className="p-4 sticky left-0 bg-inherit z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${avatarColor} flex items-center justify-center text-white font-semibold text-sm shrink-0`}
                      >
                        {avatarLetter}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#161616] truncate">
                          {entry.project_name}
                        </div>
                        <div className="text-xs text-[#525252] truncate">
                          {entry.category_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="px-3 py-3 text-sm text-[#525252]">
                    {new Date(entry.from_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* End Date */}
                  <td className="px-3 py-3 text-sm text-[#525252]">
                    {new Date(entry.to_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* Extension */}
                  <td className="px-3 py-3 text-sm text-center">
                    {entry.potential_extension ? (
                      <span className="text-[#f1c21b]">
                        {new Date(entry.potential_extension).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    ) : (
                      <span className="text-[#8d8d8d]">-</span>
                    )}
                  </td>

                  {/* Weekly Hours - Only display first 12 weeks */}
                  {displayWeeks.map((week) => {
                    const weekHours = entry.weekly_hours?.[week.id] || 0;
                    const hasHours = weekHours > 0;

                    return (
                      <td
                        key={week.id}
                        className={`px-2 py-3 text-center border-l ${
                          problemWeeks.includes(week.id)
                            ? "bg-[#fff1f1] border-[#ffb3b8]"
                            : "border-[#e0e0e0]"
                        }`}
                      >
                        {hasHours ? (
                          <div className="inline-flex items-center justify-center px-2 py-1 bg-[#0f62fe] text-white rounded text-sm font-semibold min-w-12.5">
                            {weekHours}
                          </div>
                        ) : (
                          <span className="text-[#c6c6c6]">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Actions */}
                  <td className="p-2 text-center sticky right-0 bg-inherit z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        aria-label="Edit entry"
                        type="button"
                        onClick={() => onEditEntry(entry.id)}
                        className="p-2 text-[#525252] hover:text-[#0f62fe] hover:bg-[#e0e0e0] rounded-md transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        aria-label="Delete entry"
                        type="button"
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-2 text-[#525252] hover:text-[#da1e28] hover:bg-[#e0e0e0] rounded-md transition-colors"
                      >
                        <TrashCan size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Totals Row */}
            <tr className="bg-[#e0e0e0] border-t-2 border-[#161616] font-semibold">
              <td className="p-4 text-sm sticky left-0 bg-[#e0e0e0] z-10">
                Total Assigned
              </td>
              {/* Empty cell for Start Date column */}
              <td className="bg-[#e0e0e0]" aria-label="Start Date column"></td>
              {/* Empty cell for End Date column */}
              <td className="bg-[#e0e0e0]" aria-label="End Date column"></td>
              {/* Empty cell for Extension column */}
              <td className="bg-[#e0e0e0]" aria-label="Extension column"></td>
              {displayWeeks.map((week) => {
                const total = calculateWeekTotal(week.id);
                return (
                  <td
                    key={week.id}
                    className={`px-2 py-3 text-center text-sm border-l ${
                      problemWeeks.includes(week.id)
                        ? "bg-[#ffd7d9] text-[#da1e28] border-[#ffb3b8]"
                        : "border-[#c6c6c6]"
                    }`}
                  >
                    {total > 0 ? (
                      <div className="font-bold text-[#161616]">{total}</div>
                    ) : (
                      <span className="text-[#8d8d8d]">0</span>
                    )}
                  </td>
                );
              })}
              <td className="sticky right-0 bg-[#e0e0e0] z-10"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
