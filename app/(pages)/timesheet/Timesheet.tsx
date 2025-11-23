"use client";

import { ChevronDown, ChevronRight, TrashCan } from "@carbon/icons-react";
import React, { useEffect, useState } from "react";
import { getBillCodesByUserByWeek } from "@/app/actions";
import {
  Button,
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
import type {
  BillCode,
  DayOfWeek,
  TimeEntry,
  TimesheetProps,
  WeekEnding,
  WorkItem,
} from "@/types/timesheet.types";
import {
  calculateDayTotal,
  calculateTotal,
  getDayInfo,
  getStatusColor,
} from "@/utils/timesheet/timesheet.utils";

export default function TimesheetPage({ weekEndings }: TimesheetProps) {
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding>(weekEndings[0]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([]));
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [billCodes, setBillCodes] = useState<BillCode[]>([]);

  useEffect(() => {
    const fetchUserBillCodes = async () => {
      try {
        const userBillCodes = await getBillCodesByUserByWeek(selectedWeek.id);
        setBillCodes(userBillCodes);
      } catch (error: unknown) {
        console.error("Error fetching bill codes:", (error as Error).message);
      }
    };
    fetchUserBillCodes();
  }, [selectedWeek.id]);

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: "entry-1",
      billCodeId: "1",
      subCodeId: "1-1",
      hours: { mon: 8, tue: 8, wed: 8, thu: 0, fri: 8 },
    },
    {
      id: "entry-2",
      billCodeId: "2",
      subCodeId: "2-1",
      hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
    },
    {
      id: "entry-3",
      billCodeId: "2",
      subCodeId: "2-2",
      hours: { mon: 0, tue: 0, wed: 0, thu: 8, fri: 0 },
    },
  ]);

  const toggleExpanded = (id: string): void => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const updateHours = (
    entryId: string,
    day: DayOfWeek,
    value: string,
  ): void => {
    const numValue = parseFloat(value) || 0;
    setTimeEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, hours: { ...entry.hours, [day]: numValue } }
          : entry,
      ),
    );
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

          {/* Timesheet Table - Responsive Container */}
          <div className="bg-white min-h-[400px]">
            {/* Desktop/Tablet View - Hidden on Mobile */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <TimesheetHead selectedWeek={selectedWeek} />
                <tbody>
                  {billCodes.map((billCode) => {
                    const isExpanded = expandedRows.has(billCode.id);
                    const entries = timeEntries.filter(
                      (e) => e.billCodeId === billCode.id,
                    );

                    return (
                      <React.Fragment key={billCode.id}>
                        <TimesheetBillCodes
                          billCode={billCode}
                          isExpanded={isExpanded}
                          toggleExpanded={toggleExpanded}
                        />

                        {isExpanded &&
                          billCode.workItems?.map((workItem: WorkItem) => {
                            const entry = entries.find(
                              (e) => e.subCodeId === workItem.id,
                            );
                            if (!entry) return null;

                            return (
                              <TimesheetWorkItems
                                key={entry.id}
                                entry={entry}
                                workItem={workItem}
                                deleteEntry={deleteEntry}
                                updateHours={updateHours}
                              />
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                  <TimesheetTotals timeEntries={timeEntries} />
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards Layout */}
            <div className="sm:hidden">
              {billCodes.map((billCode) => {
                const isExpanded = expandedRows.has(billCode.id);
                const entries = timeEntries.filter(
                  (e) => e.billCodeId === billCode.id,
                );

                return (
                  <div key={billCode.id} className="border-b border-slate-200">
                    {/* Bill Code Header */}
                    <button
                      type="button"
                      className="w-full text-left p-4 bg-white cursor-pointer active:bg-slate-50 focus:outline-none"
                      onClick={() => toggleExpanded(billCode.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          {isExpanded ? (
                            <ChevronDown size={20} className="text-slate-600" />
                          ) : (
                            <ChevronRight
                              size={20}
                              className="text-slate-600"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#0f62fe] text-sm">
                            {billCode.code}
                          </div>
                          <div className="text-slate-600 text-xs mt-1">
                            {billCode.description}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Work Items - Mobile Cards */}
                    {isExpanded &&
                      billCode.workItems?.map((workItem: WorkItem) => {
                        const entry = entries.find(
                          (e) => e.subCodeId === workItem.id,
                        );
                        if (!entry) return null;

                        return (
                          <div
                            key={entry.id}
                            className="bg-slate-50 border-t border-slate-200"
                          >
                            <div className="p-4">
                              {/* Sub Code Header */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">
                                    {workItem.workItemCode}
                                  </div>
                                  <div className="text-slate-600 text-xs mt-0.5">
                                    {workItem.description}
                                  </div>
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    entry.id && deleteEntry(entry.id);
                                  }}
                                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  aria-label="Delete entry"
                                >
                                  <TrashCan size={16} />
                                </Button>
                              </div>

                              {/* Days Grid */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                {(
                                  [
                                    "mon",
                                    "tue",
                                    "wed",
                                    "thu",
                                    "fri",
                                  ] as DayOfWeek[]
                                ).map((day, index) => {
                                  const dayInfo = getDayInfo(
                                    index,
                                    selectedWeek,
                                  );
                                  return (
                                    <div
                                      key={day}
                                      className="bg-white rounded-lg p-2 border border-slate-200"
                                    >
                                      <div className="text-xs text-slate-600 font-medium mb-1">
                                        {dayInfo.shortDay}
                                      </div>
                                      <div className="text-[0.625rem] text-slate-500 mb-1">
                                        {dayInfo.date}
                                      </div>
                                      <input
                                        id={`${entry.id}-${day}-mobile`}
                                        type="number"
                                        inputMode="decimal"
                                        min={0}
                                        max={24}
                                        step="0.5"
                                        value={entry.hours[day] ?? 0}
                                        onChange={(e) =>
                                          entry.id &&
                                          updateHours(
                                            entry.id,
                                            day,
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Row Total */}
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                                <span className="text-xs font-semibold text-slate-600 uppercase">
                                  Total
                                </span>
                                <span className="text-sm font-bold">
                                  {calculateTotal(entry.hours)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}

              {/* Mobile Totals */}
              <div className="bg-slate-200 p-4">
                <div className="font-semibold text-sm mb-3">Week Totals</div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(["mon", "tue", "wed", "thu", "fri"] as DayOfWeek[]).map(
                    (day, index) => {
                      const dayInfo = getDayInfo(index, selectedWeek);
                      return (
                        <div
                          key={day}
                          className="bg-white rounded-lg p-2 border border-slate-300"
                        >
                          <div className="text-xs text-slate-600 font-medium">
                            {dayInfo.shortDay}
                          </div>
                          <div className="text-sm font-bold mt-1">
                            {calculateDayTotal(day, timeEntries)}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="flex items-center justify-between bg-slate-700 text-white rounded-lg p-3">
                  <span className="text-sm font-semibold uppercase">
                    Grand Total
                  </span>
                  <span className="text-lg font-bold">
                    {timeEntries.reduce(
                      (sum, entry) => sum + calculateTotal(entry.hours),
                      0,
                    )}
                  </span>
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
