"use client";

import { Add, Grid, List, Save } from "@carbon/icons-react";
import { Tag } from "@carbon/react";
import {
  getForecastStatusColour,
  viewModeClassnames,
} from "@/utils/forecast/forecast.utils";
import Button from "../Button/Button";

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
  const { baseClassname, selectedClassname, unselectedClassname } =
    viewModeClassnames;

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
          <Tag type={getForecastStatusColour(status)} size="md">
            {status}
          </Tag>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <fieldset className="flex items-center bg-[#f4f4f4] rounded-md p-1">
            <button
              aria-label="Timeline View"
              type="button"
              onClick={() => onViewModeChange("timeline")}
              className={`${baseClassname} ${
                viewMode === "timeline"
                  ? selectedClassname
                  : unselectedClassname
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              aria-label="List View"
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`${baseClassname} ${
                viewMode === "list" ? selectedClassname : unselectedClassname
              }`}
            >
              <List size={20} />
            </button>
          </fieldset>

          {/* Action Buttons */}
          <Button
            type="button"
            onClick={onAddEntry}
            renderIcon={Add}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f62fe] text-white rounded-md hover:bg-[#0353e9] transition-colors font-normal"
          >
            Add Entry
          </Button>

          <Button
            type="button"
            onClick={onSave}
            renderIcon={Save}
            className="flex items-center gap-2 px-4 py-2 bg-[#f4f4f4] text-[#161616] rounded-md hover:bg-[#e0e0e0] transition-colors font-normal"
          >
            Save
          </Button>

          <Button
            type="button"
            kind="secondary"
            onClick={onSubmit}
            className="px-4 py-2 bg-[#24a148] text-white rounded-md hover:bg-[#198038] transition-colors font-normal"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
