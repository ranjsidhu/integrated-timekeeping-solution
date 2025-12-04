"use client";

import { Edit, TrashCan } from "@carbon/icons-react";
import type { ForecastEntry } from "@/types/forecast.types";
import type { WeekEnding } from "@/types/timesheet.types";

type ForecastTimelineProps = {
  forecastEntries: ForecastEntry[];
  weekEndings: WeekEnding[];
  onEditEntry: (entryId: number) => void;
  onDeleteEntry: (entryId: number) => void;
};

export default function ForecastTimeline({
  forecastEntries,
  weekEndings,
  onEditEntry,
  onDeleteEntry,
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

  return (
    <div className="space-y-4">
      {forecastEntries.map((entry) => (
        <ForecastTimelineCard
          key={entry.id}
          entry={entry}
          weekEndings={weekEndings}
          onEditEntry={onEditEntry}
          onDeleteEntry={onDeleteEntry}
        />
      ))}
    </div>
  );
}

type ForecastTimelineCardProps = {
  entry: ForecastEntry;
  weekEndings: WeekEnding[];
  onEditEntry: (entryId: number) => void;
  onDeleteEntry: (entryId: number) => void;
};

function ForecastTimelineCard({
  entry,
  weekEndings,
  onEditEntry,
  onDeleteEntry,
}: ForecastTimelineCardProps) {
  const avatarLetter = entry.project_name?.charAt(0).toUpperCase() || "P";

  // IBM Carbon color scheme
  const avatarColor =
    entry.category_name === "Holiday"
      ? "bg-[#8a3ffc]" // Purple
      : entry.category_name === "Training"
        ? "bg-[#0f62fe]" // Blue
        : "bg-[#24a148]"; // Green

  const categoryBadgeColor =
    entry.assignment_type === "Productive"
      ? "bg-[#defbe6] text-[#0e6027]" // Green tint
      : "bg-[#e8daff] text-[#6929c4]"; // Purple tint

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-lg ${avatarColor} flex items-center justify-center text-white font-semibold text-lg`}
            >
              {avatarLetter}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#161616]">
                {entry.project_name}
              </h3>
              <p className="text-sm text-[#525252]">
                {entry.client_name || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${categoryBadgeColor}`}
            >
              {entry.category_name}
            </span>
            <button
              aria-label="Edit entry"
              type="button"
              onClick={() => onEditEntry(entry.id)}
              className="p-2 text-[#525252] hover:text-[#0f62fe] hover:bg-[#e0e0e0] rounded-md transition-colors"
            >
              <Edit size={18} />
            </button>
            <button
              aria-label="Delete entry"
              type="button"
              onClick={() => onDeleteEntry(entry.id)}
              className="p-2 text-[#525252] hover:text-[#da1e28] hover:bg-[#e0e0e0] rounded-md transition-colors"
            >
              <TrashCan size={18} />
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-4 mb-4 text-sm text-[#525252]">
          <div className="flex items-center gap-2">
            <span className="text-[#8d8d8d]">From:</span>
            <span className="font-medium text-[#161616]">
              {new Date(entry.from_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <span className="text-[#c6c6c6]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8d8d8d]">To:</span>
            <span className="font-medium text-[#161616]">
              {new Date(entry.to_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {entry.potential_extension && (
            <>
              <span className="text-[#c6c6c6]">|</span>
              <div className="flex items-center gap-2">
                <span className="text-[#8d8d8d]">Extension:</span>
                <span className="font-medium text-[#f1c21b]">
                  {new Date(entry.potential_extension).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Weekly Hours Timeline */}
        <div className="bg-[#f4f4f4] rounded-lg p-4">
          <div className={`grid grid-cols-${weekEndings.length} gap-2`}>
            {weekEndings.map((week, index) => {
              const weekHours = entry.weekly_hours?.[week.id] || 0;
              const hasHours = weekHours > 0;

              return (
                <div key={week.id} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-[#525252] font-medium">
                    W{index + 1}
                  </div>
                  <div
                    className={`w-full h-16 rounded-md flex items-center justify-center text-sm font-semibold transition-all ${
                      hasHours
                        ? "bg-[#0f62fe] text-white"
                        : "bg-[#e0e0e0] text-[#8d8d8d]"
                    }`}
                  >
                    {hasHours ? `${weekHours}h` : "-"}
                  </div>
                  <div className="text-xs text-[#8d8d8d]">
                    {new Date(week.week_ending).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-[#525252]">Total Hours</span>
          <span className="text-lg font-semibold text-[#161616]">
            {Object.values(entry.weekly_hours || {}).reduce(
              (sum, hours) => sum + hours,
              0,
            )}
            h
          </span>
        </div>
      </div>
    </div>
  );
}
