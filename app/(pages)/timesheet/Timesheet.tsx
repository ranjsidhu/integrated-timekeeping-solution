"use client";

import { useEffect, useState } from "react";
import { getTimesheetByWeekEnding } from "@/app/actions";
import {
  Column,
  Grid,
  InlineNotification,
  Tag,
  TimesheetActions,
  TimesheetControls,
} from "@/app/components";
import TimesheetCards from "@/app/components/Timesheet/TimesheetCards";
import { useSelectedCode } from "@/app/providers";
import type {
  DayOfWeek,
  TimeEntry,
  TimesheetProps,
  WeekEnding,
} from "@/types/timesheet.types";
import {
  calculateDayTotal,
  calculateTotal,
  getStatusColor,
} from "@/utils/timesheet/timesheet.utils";

export default function TimesheetPage({ weekEndings }: TimesheetProps) {
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding>(weekEndings[0]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([]));
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { code: selectedCode, workItems, filterWorkItems } = useSelectedCode();

  // Temporary editing buffer for inputs: entryId -> { day -> string }
  const [editingValues, setEditingValues] = useState<
    Record<string, Partial<Record<DayOfWeek, string>>>
  >({});

  const handleTempChange = (entryId: string, day: DayOfWeek, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [entryId]: { ...(prev[entryId] ?? {}), [day]: value },
    }));
  };

  const handleCommit = (entryId: string, day: DayOfWeek) => {
    const buffer = editingValues[entryId]?.[day];
    const entry = timeEntries.find((e) => e.id === entryId);
    const raw =
      buffer !== undefined ? buffer : String(entry?.hours[day] ?? "0");
    const num = raw === "" ? 0 : Number.parseFloat(raw);
    // commit numeric value into model
    setTimeEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, hours: { ...e.hours, [day]: num } } : e,
      ),
    );
    // clear buffer for that field
    setEditingValues((prev) => ({
      ...prev,
      [entryId]: { ...(prev[entryId] ?? {}), [day]: undefined },
    }));
  };

  useEffect(() => {
    const fetchUserBillCodes = async () => {
      try {
        const timesheet = await getTimesheetByWeekEnding(selectedWeek.id);
        console.log(
          "🚀 ~ fetchUserBillCodes ~ timesheet:",
          timesheet.data?.bill_code_summary,
        );
        if (!timesheet.data?.bill_code_summary && selectedCode) {
          setTimeEntries(
            workItems.map((workItem) => ({
              id: `entry-${workItem.id}`,
              billCodeId: selectedCode.id,
              subCodeId: workItem.id,
              hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
            })),
          );
        }
      } catch (error: unknown) {
        console.error("Error fetching bill codes:", (error as Error).message);
      }
    };
    fetchUserBillCodes();
  }, [selectedWeek.id, selectedCode, workItems]);

  const toggleExpanded = (id: number): void => {
    const castedId = id.toString();
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(castedId)) {
        newSet.delete(castedId);
      } else {
        newSet.add(castedId);
      }
      return newSet;
    });
  };

  const handleSave = (): void => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    console.log("Saving timesheet...", { selectedWeek, timeEntries });
  };

  const handleSubmit = (): void => {
    console.log("Submitting timesheet...", { selectedWeek, timeEntries });
  };

  const deleteEntry = (entryId: string): void => {
    filterWorkItems(Number(entryId));
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  return (
    <div className="w-full bg-slate-50 min-h-full">
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          {/* Header */}
          <div className="bg-white p-4 sm:p-6 border-b border-slate-200">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h1 className="text-2xl sm:text-3xl font-normal text-[#161616] m-0">
                Timesheets
              </h1>
              {selectedWeek?.status && (
                <Tag type={getStatusColor(selectedWeek.status)} size="md">
                  {selectedWeek.status.charAt(0).toUpperCase() +
                    selectedWeek.status.slice(1)}
                </Tag>
              )}
            </div>
          </div>

          {/* Notification */}
          {showNotification && (
            <div className="p-3 sm:p-4">
              <InlineNotification
                kind="success"
                title="Timesheet saved"
                subtitle="Your changes have been saved successfully"
                hideCloseButton={false}
                onClose={() => setShowNotification(false)}
                lowContrast
              />
            </div>
          )}

          {/* Controls */}
          <TimesheetControls
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            weekEndings={weekEndings}
          />

          {/* Timesheet Cards (modern, responsive) */}
          <div className="bg-white min-h-[400px]">
            <div className="p-0 sm:p-4">
              <TimesheetCards
                workItems={workItems}
                expandedRows={expandedRows}
                toggleExpanded={toggleExpanded}
                editingValues={editingValues}
                onTempChange={handleTempChange}
                onCommit={handleCommit}
                deleteEntry={deleteEntry}
                timeEntries={timeEntries}
              />

              {/* Totals summary */}
              <div className="mt-4 p-4 bg-slate-50 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="font-semibold">Week Totals</div>
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <div className="px-2 py-1 bg-white rounded shadow-sm">
                    Mon: {calculateDayTotal("mon", timeEntries)}
                  </div>
                  <div className="px-2 py-1 bg-white rounded shadow-sm">
                    Tue: {calculateDayTotal("tue", timeEntries)}
                  </div>
                  <div className="px-2 py-1 bg-white rounded shadow-sm">
                    Wed: {calculateDayTotal("wed", timeEntries)}
                  </div>
                  <div className="px-2 py-1 bg-white rounded shadow-sm">
                    Thu: {calculateDayTotal("thu", timeEntries)}
                  </div>
                  <div className="px-2 py-1 bg-white rounded shadow-sm">
                    Fri: {calculateDayTotal("fri", timeEntries)}
                  </div>
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

            {/* Action Buttons */}
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
