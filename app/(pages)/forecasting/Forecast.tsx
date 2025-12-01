"use client";

import { useState } from "react";
import {
  Column,
  ForecastActions,
  ForecastControls,
  Grid,
  Loading,
  Notifications,
  Tag,
} from "@/app/components";
import ForecastTable from "@/app/components/Forecast/ForecastTable";
import { useForecastData } from "@/app/hooks";
import type { ForecastProps } from "@/types/forecast.types";

export default function ForecastPage({ weekEndings }: ForecastProps) {
  const [forecastStatus, setForecastStatus] = useState<string>("Draft");

  // Load and manage forecast data
  const { forecastEntries, isLoading, setForecastEntries } =
    useForecastData(setForecastStatus);

  const handleSave = async () => {
    // TODO: Implement save
    console.log("Saving forecast...", forecastEntries);
  };

  const handleSubmit = async () => {
    // TODO: Implement submit
    console.log("Submitting forecast...", forecastEntries);
  };

  const handleAddEntry = () => {
    // TODO: Open modal/navigate to add entry page
    console.log("Add entry");
  };

  const handleEditEntry = (entryId: number) => {
    // TODO: Open modal/navigate to edit entry page
    console.log("Edit entry", entryId);
  };

  const handleDeleteEntry = (entryId: number) => {
    setForecastEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  // Calculate weekly totals
  const calculateWeekTotal = (weekId: number) => {
    return forecastEntries.reduce((sum, entry) => {
      const weekHours =
        entry.weekly_hours?.[weekId] || entry.hours_per_week || 0;
      return sum + weekHours;
    }, 0);
  };

  return (
    <div className="w-full bg-slate-50 min-h-full">
      <Loading active={isLoading} />
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          {/* Header */}
          <div className="bg-white p-4 sm:p-6 border-b border-slate-200">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h1 className="text-2xl sm:text-3xl font-normal text-[#161616] m-0">
                My Hours Plan
              </h1>
              {forecastStatus && (
                <Tag
                  type={
                    forecastStatus === "Submitted"
                      ? "blue"
                      : forecastStatus === "Processed"
                        ? "green"
                        : "gray"
                  }
                  size="md"
                >
                  {forecastStatus}
                </Tag>
              )}
            </div>
          </div>

          <Notifications />

          {/* Controls */}
          <ForecastControls onAddEntry={handleAddEntry} />

          {/* Main content */}
          <div className="bg-white min-h-[400px]">
            <div className="p-0 sm:p-4">
              <ForecastTable
                forecastEntries={forecastEntries}
                displayWeeks={weekEndings}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
              />

              {/* Week totals */}
              <div className="mt-4 p-4 bg-slate-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-600">
                    Total Assigned:
                  </div>
                  <div className="flex items-center gap-4">
                    {weekEndings.map((week) => (
                      <div
                        key={week.id}
                        className="text-center text-sm font-semibold min-w-[60px]"
                      >
                        {calculateWeekTotal(week.id)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <ForecastActions
              handleSave={handleSave}
              handleSubmit={handleSubmit}
            />
          </div>
        </Column>
      </Grid>
    </div>
  );
}
