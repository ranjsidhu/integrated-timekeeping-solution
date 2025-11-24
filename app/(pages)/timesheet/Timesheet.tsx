"use client";

import React, { useEffect, useState } from "react";
import { getTimesheetByWeekEnding } from "@/app/actions";
import {
  Column,
  Grid,
  InlineNotification,
  Tag,
  TimesheetActions,
  TimesheetBillCodes,
  TimesheetControls,
  TimesheetHead,
  TimesheetTotals,
  TimesheetWorkItems,
} from "@/app/components";
import { useSelectedCode } from "@/app/providers";
import type {
  DayOfWeek,
  TimeEntry,
  TimesheetProps,
  WeekEnding,
} from "@/types/timesheet.types";
import { getStatusColor } from "@/utils/timesheet/timesheet.utils";

export default function TimesheetPage({ weekEndings }: TimesheetProps) {
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding>(weekEndings[0]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([]));
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { code: selectedCode, workItems } = useSelectedCode();

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

          {/* Timesheet Table */}
          <div className="bg-white min-h-[400px]">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <TimesheetHead selectedWeek={selectedWeek} />
                <tbody className="w-full">
                  {workItems.map((workItem) => {
                    const isExpanded = expandedRows.has(workItem.id.toString());

                    return (
                      <React.Fragment key={workItem.id}>
                        <TimesheetWorkItems
                          workItem={workItem}
                          isExpanded={isExpanded}
                          toggleExpanded={toggleExpanded}
                        />
                        {isExpanded && workItem.bill_codes && (
                          <TimesheetBillCodes
                            billCodes={workItem.bill_codes}
                            editingValues={editingValues}
                            onTempChange={handleTempChange}
                            onCommit={handleCommit}
                            deleteEntry={deleteEntry}
                            entry={
                              timeEntries.find(
                                (entry) => entry.subCodeId === workItem.id,
                              ) as TimeEntry
                            }
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                  <TimesheetTotals timeEntries={timeEntries} />
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <TimesheetActions
              handleSave={handleSave}
              handleSubmit={handleSubmit}
            />
          </div>
        </Column>
      </Grid>

      <style>
        {`
        /* Ensure inputs don't zoom on mobile Safari */
        input[type="number"] {
          font-size: 16px !important;
        }

        @media (min-width: 640px) {
          input[type="number"] {
            font-size: 0.875rem !important;
          }
        }

        /* Remove number input spinners on mobile */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}
      </style>
    </div>
  );
}
