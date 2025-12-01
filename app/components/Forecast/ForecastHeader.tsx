"use client";

import { Add, Grid, List, Save } from "@carbon/icons-react";
import { Tag } from "@carbon/react";

type ForecastHeaderProps = {
  status: string;
  viewMode: "timeline" | "list";
  onViewModeChange: (mode: "timeline" | "list") => void;
  onAddEntry: () => void;
  onSave: () => void;
  onSubmit: () => void;
};

export default function ForecastHeader({
  status,
  viewMode,
  onViewModeChange,
  onAddEntry,
  onSave,
  onSubmit,
}: ForecastHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#161616] mb-1">
              My Hours Plan
            </h1>
            <p className="text-sm text-[#525252]">
              Plan your next 12 weeks of work
            </p>
          </div>
          <Tag
            type={
              status === "Submitted"
                ? "blue"
                : status === "Processed"
                  ? "green"
                  : "gray"
            }
            size="md"
          >
            {status}
          </Tag>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center bg-[#f4f4f4] rounded-md p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("timeline")}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === "timeline"
                  ? "bg-white shadow-sm text-[#161616]"
                  : "text-[#525252] hover:text-[#161616]"
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-[#161616]"
                  : "text-[#525252] hover:text-[#161616]"
              }`}
            >
              <List size={20} />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={onAddEntry}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f62fe] text-white rounded-md hover:bg-[#0353e9] transition-colors font-normal"
          >
            <Add size={20} />
            Add Entry
          </button>

          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#f4f4f4] text-[#161616] rounded-md hover:bg-[#e0e0e0] transition-colors font-normal"
          >
            <Save size={20} />
            Save
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 bg-[#24a148] text-white rounded-md hover:bg-[#198038] transition-colors font-normal"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
