// TODO - replace hardcoded data with API integration
// TODO - seperate client and server components

"use client";

import { Add, ChevronDown, ChevronRight, TrashCan } from "@carbon/icons-react";
import React, { useState } from "react";
import {
  Button,
  Column,
  Dropdown,
  Grid,
  IconButton,
  InlineNotification,
  Tag,
} from "@/app/components";
import type {
  BillCode,
  DayOfWeek,
  SubCode,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";
import {
  calculateDayTotal,
  calculateTotal,
  generateWeekEndings,
  getDayInfo,
  getStatusColor,
} from "@/utils/timesheet/timesheet.utils";

export default function TimesheetPageResponsive() {
  const [weekEndings] = useState<WeekEnding[]>(generateWeekEndings());
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding>(weekEndings[0]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(["1", "2"]),
  );
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const [billCodes] = useState<BillCode[]>([
    {
      id: "1",
      code: "UKAIDEG – SOW003",
      description: "DWP Ask Nexus Training",
      projectName: "DWP Project",
      subCodes: [
        { id: "1-1", code: "GB0020", description: "General Billable" },
      ],
    },
    {
      id: "2",
      code: "SK77",
      description: "NON-CHARGEABLE OVERHEAD",
      subCodes: [
        {
          id: "2-1",
          code: "L1LEARN",
          description: "Approved Non-IBM Learning",
        },
        { id: "2-2", code: "XLOH00", description: "NON-IBM LEARNING" },
      ],
    },
  ]);

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
    <div className="w-screen bg-slate-50 min-h-screen">
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          {/* Header */}
          <div className="bg-white p-6 border-b border-slate-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-normal text-[#161616] m-0">
                Timesheets
              </h1>
              {selectedWeek.status && (
                <Tag type={getStatusColor(selectedWeek.status)} size="md">
                  {selectedWeek.status.charAt(0).toUpperCase() +
                    selectedWeek.status.slice(1)}
                </Tag>
              )}
            </div>
          </div>

          {/* Notification */}
          {showNotification && (
            <div className="p-4">
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
          <div className="bg-white p-6 border-b border-slate-200">
            <Grid narrow>
              <Column lg={4} md={4} sm={4} className="mb-4">
                <Dropdown
                  id="week-ending"
                  titleText="Week ending"
                  label={selectedWeek.label}
                  items={weekEndings}
                  itemToString={(item) => (item ? item.label : "")}
                  onChange={({ selectedItem }) => {
                    if (selectedItem) setSelectedWeek(selectedItem);
                  }}
                  size="lg"
                />
              </Column>

              <Column lg={12} md={4} sm={4}>
                <div className="flex gap-3 flex-wrap items-end">
                  <Button kind="primary" renderIcon={Add} size="md">
                    <span className="button-text">Add bill code</span>
                  </Button>

                  <Button
                    kind="tertiary"
                    size="md"
                    className="whitespace-nowrap"
                  >
                    <span className="button-text-short">Copy template</span>
                  </Button>

                  <Button
                    kind="tertiary"
                    size="md"
                    className="whitespace-nowrap"
                  >
                    <span className="button-text-short">Copy prev week</span>
                  </Button>
                </div>
              </Column>
            </Grid>
          </div>

          {/* Timesheet Table - Responsive Container */}
          <div className="bg-white min-h-[400px]">
            {/* Desktop/Tablet View */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-left font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[250px] sticky left-0 bg-slate-50 z-10">
                      Project / Activity
                    </th>
                    {[0, 1, 2, 3, 4].map((offset) => {
                      const dayInfo = getDayInfo(offset, selectedWeek);
                      return (
                        <th
                          key={offset}
                          className="px-2 py-3 text-center font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[90px] max-w-[120px]"
                        >
                          <div>{dayInfo.shortDay}</div>
                          <div className="font-normal mt-1 text-[0.6875rem]">
                            {dayInfo.date}
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-3 py-3 text-center font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-20">
                      Total
                    </th>
                    <th className="min-w-[60px] sticky right-0 bg-slate-50 z-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {billCodes.map((billCode) => {
                    const isExpanded = expandedRows.has(billCode.id);
                    const entries = timeEntries.filter(
                      (e) => e.billCodeId === billCode.id,
                    );

                    return (
                      <React.Fragment key={billCode.id}>
                        {/* Bill Code Row */}
                        <tr
                          className="bg-white border-b border-slate-200 cursor-pointer"
                          onClick={() => toggleExpanded(billCode.id)}
                        >
                          <td className="p-4 sticky left-0 bg-white z-10">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown size={20} className="shrink-0" />
                              ) : (
                                <ChevronRight size={20} className="shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-[#0f62fe] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {billCode.code}
                                </div>
                                <div className="text-slate-600 text-[0.8125rem] mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {billCode.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td colSpan={7}></td>
                        </tr>

                        {/* Sub Code Rows */}
                        {isExpanded &&
                          billCode.subCodes?.map((subCode: SubCode) => {
                            const entry = entries.find(
                              (e) => e.subCodeId === subCode.id,
                            );
                            if (!entry) return null;

                            return (
                              <tr
                                key={entry.id}
                                className="bg-slate-50 border-b border-slate-200"
                              >
                                <td className="pl-12 pr-4 py-3 sticky left-0 bg-slate-50 z-10">
                                  <div className="min-w-0">
                                    <div className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                      {subCode.code}
                                    </div>
                                    <div className="text-slate-600 text-[0.8125rem] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                                      {subCode.description}
                                    </div>
                                  </div>
                                </td>
                                {(
                                  [
                                    "mon",
                                    "tue",
                                    "wed",
                                    "thu",
                                    "fri",
                                  ] as DayOfWeek[]
                                ).map((day) => (
                                  <td key={day} className="p-2 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="24"
                                      step="1"
                                      value={entry.hours[day] || 0}
                                      onChange={(e) =>
                                        entry.id &&
                                        updateHours(
                                          entry.id,
                                          day,
                                          e.target.value,
                                        )
                                      }
                                      className="w-full max-w-[70px] px-1 py-2 border border-slate-400 rounded-none text-center text-sm font-inherit focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>
                                ))}
                                <td className="px-3 py-2 text-center font-semibold text-sm">
                                  {calculateTotal(entry.hours)}
                                </td>
                                <td className="p-2 text-center sticky right-0 bg-slate-50 z-10">
                                  <IconButton
                                    label="Delete entry"
                                    kind="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      entry.id && deleteEntry(entry.id);
                                    }}
                                  >
                                    <TrashCan size={16} />
                                  </IconButton>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}

                  {/* Totals Row */}
                  <tr className="bg-slate-200 font-semibold border-t-2 border-slate-700">
                    <td className="p-4 text-sm sticky left-0 bg-slate-200 z-10">
                      Total
                    </td>
                    {(["mon", "tue", "wed", "thu", "fri"] as DayOfWeek[]).map(
                      (day) => (
                        <td key={day} className="px-3 py-4 text-center text-sm">
                          {calculateDayTotal(day, timeEntries)}
                        </td>
                      ),
                    )}
                    <td className="px-3 py-4 text-center text-sm">
                      {timeEntries.reduce(
                        (sum, entry) => sum + calculateTotal(entry.hours),
                        0,
                      )}
                    </td>
                    <td className="sticky right-0 bg-slate-200 z-10"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 p-6 border-t border-slate-200 bg-white flex-wrap">
              <Button
                kind="secondary"
                size="lg"
                onClick={handleSave}
                className="flex-1 min-w-[120px]"
              >
                Save
              </Button>

              <Button
                kind="primary"
                size="lg"
                onClick={handleSubmit}
                className="flex-1 min-w-[120px]"
              >
                Submit
              </Button>
            </div>
          </div>
        </Column>
      </Grid>

      <style>{`
        /* Responsive text adjustments */
        @media (max-width: 672px) {
          .button-text {
            font-size: 0.8125rem;
          }
          .button-text-short {
            font-size: 0.75rem;
          }
        }

        /* Ensure inputs don't zoom on mobile Safari */
        input[type="number"] {
          font-size: 16px !important;
        }

        @media (min-width: 673px) {
          input[type="number"] {
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
}
