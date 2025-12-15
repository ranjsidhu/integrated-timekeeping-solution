"use client";

import { Download } from "@carbon/icons-react";
import { Select, SelectItem } from "@carbon/react";
import { useState } from "react";
import { getProtectedExportData } from "@/app/actions";
import type {
  AnalyticsFiltersProps,
  ExportDataType,
} from "@/types/analytics.types";
import { exportToCSV } from "@/utils/export/exportToCsv";
import Button from "../Button/Button";

const WEEK_OPTIONS = [
  { value: 4, label: "Next 4 Weeks" },
  { value: 8, label: "Next 8 Weeks" },
  { value: 12, label: "Next 12 Weeks" },
  { value: 16, label: "Next Quarter (16 Weeks)" },
  { value: 26, label: "Next 6 Months (26 Weeks)" },
];

export default function AnalyticsFilters({
  weeksToShow,
  onWeeksChange,
}: AnalyticsFiltersProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (dataType: ExportDataType) => {
    setIsExporting(true);
    try {
      const data = await getProtectedExportData(dataType, weeksToShow);

      if (data.length === 0) {
        alert("No data available to export");
        return;
      }

      const filenameMap = {
        team: "team_capacity",
        projects: "project_analytics",
        "forecast-actuals": "forecast_vs_actuals",
      };

      exportToCSV(data, filenameMap[dataType]);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. You may not have permission.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col gap-6">
        {/* Top Row: Title and Time Period */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#161616]">Filters</h3>
            <p className="text-sm text-[#525252] mt-1">
              Customize your analytics view
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Select
              id="weeks-selector"
              labelText="Time Period"
              value={weeksToShow.toString()}
              onChange={(e) => onWeeksChange(Number(e.target.value))}
            >
              {WEEK_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  text={option.label}
                />
              ))}
            </Select>
          </div>
        </div>

        {/* Bottom Row: Export Buttons */}
        <div className="border-t border-[#e0e0e0] pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-sm font-medium text-[#161616]">
              Export Data:
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                kind="secondary"
                size="sm"
                onClick={() => handleExport("team")}
                disabled={isExporting}
                renderIcon={Download}
              >
                Team Capacity
              </Button>
              <Button
                kind="secondary"
                size="sm"
                onClick={() => handleExport("projects")}
                disabled={isExporting}
                renderIcon={Download}
              >
                Project Analytics
              </Button>
              <Button
                kind="secondary"
                size="sm"
                onClick={() => handleExport("forecast-actuals")}
                disabled={isExporting}
                renderIcon={Download}
              >
                Forecast vs Actuals
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
