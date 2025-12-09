"use client";

import { ChevronRight, Edit, TrashCan } from "@carbon/icons-react";
import { useState } from "react";
import type { ForecastEntriesListProps } from "@/types/forecast.types";

export default function ForecastEntriesList({
  forecastEntries,
  onEditEntry,
  onDeleteEntry,
}: ForecastEntriesListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (forecastEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <p className="text-[#525252]">
          No entries yet. Click "Add Entry" to start.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {forecastEntries.map((entry, index) => {
        const isExpanded = expandedId === entry.id;
        const avatarLetter = entry.project_name?.charAt(0).toUpperCase() || "P";
        const avatarColor =
          entry.category_name === "Holiday"
            ? "bg-[#8a3ffc]"
            : entry.category_name === "Training"
              ? "bg-[#0f62fe]"
              : "bg-[#24a148]";

        return (
          <div
            key={entry.id}
            className={`${index !== 0 ? "border-t border-[#e0e0e0]" : ""}`}
          >
            <button
              aria-label="Toggle entry details"
              aria-expanded={isExpanded}
              aria-controls="entry-details"
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-[#f4f4f4] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-md ${avatarColor} flex items-center justify-center text-white font-semibold`}
                >
                  {avatarLetter}
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-[#161616]">
                    {entry.project_name}
                  </div>
                  <div className="text-sm text-[#525252]">
                    {entry.category_name}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="text-2xl font-semibold text-[#161616]">
                    {Object.values(entry.weekly_hours || {}).reduce(
                      (sum, hours) => sum + hours,
                      0,
                    )}
                    h
                  </div>
                  <div className="text-xs text-[#8d8d8d]">total</div>
                </div>
                <ChevronRight
                  size={20}
                  className={`text-[#8d8d8d] transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>

            {isExpanded && (
              <section className="px-6 pb-6 bg-[#f4f4f4]" id="entry-details">
                <div className="bg-white rounded-lg p-4 space-y-4 border border-[#e0e0e0]">
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#525252]">Start:</span>
                      <span className="ml-2 font-medium text-[#161616]">
                        {new Date(entry.from_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#525252]">Category:</span>
                      <span className="ml-2 font-medium text-[#161616]">
                        {entry.category_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#525252]">End:</span>
                      <span className="ml-2 font-medium text-[#161616]">
                        {new Date(entry.to_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-[#e0e0e0]">
                    <button
                      type="button"
                      onClick={() => onEditEntry(entry.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#e0e0e0] text-[#0f62fe] rounded-md hover:bg-[#c6c6c6] transition-colors font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#e0e0e0] text-[#da1e28] rounded-md hover:bg-[#c6c6c6] transition-colors font-medium"
                    >
                      <TrashCan size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        );
      })}
    </div>
  );
}
