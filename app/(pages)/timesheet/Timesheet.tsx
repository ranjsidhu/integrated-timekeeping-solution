"use client";

import { useState } from "react";
import {
  Column,
  Grid,
  Loading,
  Notifications,
  Tag,
  TimesheetActions,
  TimesheetControls,
} from "@/app/components";
import TimesheetCards from "@/app/components/Timesheet/TimesheetCards";
import {
  useTimesheetActions,
  useTimesheetData,
  useTimesheetEditing,
} from "@/app/hooks";
import { useSelectedWeek } from "@/app/providers";
import type { TimesheetProps, WeekEnding } from "@/types/timesheet.types";
import {
  calculateDayTotal,
  calculateTotal,
  getStatusColor,
} from "@/utils/timesheet/timesheet.utils";

export default function TimesheetPage({ weekEndings }: TimesheetProps) {
  const { selectedWeek: contextWeek, setSelectedWeek: setContextWeek } =
    useSelectedWeek();

  const initialWeek = contextWeek || weekEndings[0];
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding>(initialWeek);
  const [timesheetStatus, setTimesheetStatus] = useState(initialWeek.status);

  // Load and manage timesheet data
  const {
    workItems,
    timeEntries,
    expandedRows,
    isLoading,
    setWorkItems,
    setTimeEntries,
    setExpandedRows,
  } = useTimesheetData(selectedWeek, setTimesheetStatus);

  // Handle editing interactions
  const { editingValues, handleTempChange, handleCommit, toggleExpanded } =
    useTimesheetEditing(timeEntries, setTimeEntries);

  // Handle save, submit, copy, delete actions
  const { handleSave, handleSubmit, handleCopyWeek, deleteEntry } =
    useTimesheetActions(
      selectedWeek,
      timeEntries,
      setWorkItems,
      setTimeEntries,
      setTimesheetStatus,
    );

  const handleWeekChange = (week: WeekEnding) => {
    setSelectedWeek(week);
    setContextWeek(week);
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
                Timesheets
              </h1>
              {timesheetStatus && (
                <Tag type={getStatusColor(timesheetStatus)} size="md">
                  {timesheetStatus.charAt(0).toUpperCase() +
                    timesheetStatus.slice(1)}
                </Tag>
              )}
            </div>
          </div>

          <Notifications />

          {/* Controls */}
          <TimesheetControls
            selectedWeek={selectedWeek}
            setSelectedWeek={handleWeekChange}
            onCopyWeek={handleCopyWeek}
            weekEndings={weekEndings}
          />

          {/* Main content */}
          <div className="bg-white min-h-[400px]">
            <div className="p-0 sm:p-4">
              <TimesheetCards
                workItems={workItems}
                expandedRows={expandedRows}
                toggleExpanded={(id) => toggleExpanded(id, setExpandedRows)}
                editingValues={editingValues}
                onTempChange={handleTempChange}
                onCommit={handleCommit}
                deleteEntry={deleteEntry}
                timeEntries={timeEntries}
                weekEnd={selectedWeek.week_ending}
              />

              {/* Week totals */}
              <div className="mt-4 p-4 bg-slate-50 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="font-semibold">Week Totals</div>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  {(["mon", "tue", "wed", "thu", "fri"] as const).map((day) => (
                    <div
                      key={day}
                      className="px-2 py-1 bg-white rounded shadow-sm"
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                      {calculateDayTotal(day, timeEntries)}
                    </div>
                  ))}
                  <div className="px-3 py-1 bg-[#0f62fe] text-white rounded font-semibold">
                    Total:{" "}
                    {timeEntries.reduce(
                      (sum, entry) => sum + calculateTotal(entry.hours),
                      0,
                    )}
                  </div>
                </div>
              </div>
            </div>

            <TimesheetActions
              handleSave={handleSave}
              handleSubmit={handleSubmit}
            />
          </div>
        </Column>
      </Grid>
    </div>
  );
}
