"use client";

import { Edit, TrashCan } from "@carbon/icons-react";
import type { ForecastEntry } from "@/types/forecast.types";
import type { WeekEnding } from "@/types/timesheet.types";
import IconButton from "../IconButton/IconButton";

type ForecastTableProps = {
  forecastEntries: ForecastEntry[];
  displayWeeks: WeekEnding[];
  onEditEntry: (entryId: number) => void;
  onDeleteEntry: (entryId: number) => void;
};

export default function ForecastTable({
  forecastEntries,
  displayWeeks,
  onEditEntry,
  onDeleteEntry,
}: ForecastTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-left font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[300px] sticky left-0 bg-slate-50 z-10">
              Client | Claim Code | Project
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[120px]">
              Start Date
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[120px]">
              End Date
            </th>
            <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[140px]">
              Potential Extension
            </th>
            {displayWeeks.map((week) => (
              <th
                key={week.id}
                className="px-3 py-3 text-center font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-20"
              >
                <div>{week.label}</div>
              </th>
            ))}
            <th className="min-w-[100px] sticky right-0 bg-slate-50 z-10 text-center font-semibold text-xs text-slate-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {forecastEntries.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-8 text-center text-slate-500">
                No forecast entries. Click "Add" to create your first entry.
              </td>
            </tr>
          ) : (
            forecastEntries.map((entry) => (
              <ForecastRow
                key={entry.id}
                entry={entry}
                weekColumns={displayWeeks}
                onEditEntry={onEditEntry}
                onDeleteEntry={onDeleteEntry}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

type ForecastRowProps = {
  entry: ForecastEntry;
  weekColumns: WeekEnding[];
  onEditEntry: (entryId: number) => void;
  onDeleteEntry: (entryId: number) => void;
};

function ForecastRow({
  entry,
  weekColumns,
  onEditEntry,
  onDeleteEntry,
}: ForecastRowProps) {
  // Get avatar letter from project name
  const avatarLetter = entry.project_name?.charAt(0).toUpperCase() || "P";

  // Determine avatar color based on category
  const avatarColor =
    entry.category_name === "Holiday"
      ? "bg-purple-200 text-purple-700"
      : entry.category_name === "Training"
        ? "bg-blue-200 text-blue-700"
        : "bg-green-200 text-green-700";

  return (
    <tr className="bg-white border-b border-slate-200 hover:bg-slate-50">
      <td className="p-4 sticky left-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${avatarColor}`}
          >
            {avatarLetter}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[#161616] truncate">
              {entry.client_name || "N/A"}
            </div>
            <div className="text-slate-600 text-sm mt-1 truncate">
              {entry.project_name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        {new Date(entry.from_date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-3 text-sm">
        {new Date(entry.to_date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-3 text-sm text-center">
        {entry.potential_extension
          ? new Date(entry.potential_extension).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-"}
      </td>
      {weekColumns.map((week) => {
        const weekHours =
          entry.weekly_hours?.[week.id] || entry.hours_per_week || 0;
        return (
          <td
            key={week.id}
            className="px-3 py-3 text-center text-sm font-medium"
          >
            {weekHours > 0 ? weekHours : ""}
          </td>
        );
      })}
      <td className="p-2 sticky right-0 bg-white z-10">
        <div className="flex items-center justify-center gap-2">
          <IconButton
            label="Edit entry"
            kind="ghost"
            size="sm"
            onClick={() => onEditEntry(entry.id)}
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            label="Delete entry"
            kind="ghost"
            size="sm"
            onClick={() => onDeleteEntry(entry.id)}
          >
            <TrashCan size={16} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
