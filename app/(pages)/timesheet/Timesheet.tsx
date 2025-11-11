// TODO - replace hardcoded data with API integration
// TODO - seperate client and server components

"use client";

import React, { useState } from "react";
import {
  Column,
  Grid,
  InlineNotification,
  Tag,
  TimesheetActions,
  TimesheetBillCodes,
  TimesheetControls,
  TimesheetHead,
  TimesheetSubCodes,
  TimesheetTotals,
} from "@/app/components";
import type {
  BillCode,
  DayOfWeek,
  SubCode,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";
import {
  generateWeekEndings,
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
          <TimesheetControls
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            weekEndings={weekEndings}
          />

          {/* Timesheet Table - Responsive Container */}
          <div className="bg-white min-h-[400px]">
            {/* Desktop/Tablet View */}
            <div className="overflow-x-auto">
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
                        {/* Bill Code Row */}
                        <TimesheetBillCodes
                          billCode={billCode}
                          isExpanded={isExpanded}
                          toggleExpanded={toggleExpanded}
                        />

                        {/* Sub Code Rows */}
                        {isExpanded &&
                          billCode.subCodes?.map((subCode: SubCode) => {
                            const entry = entries.find(
                              (e) => e.subCodeId === subCode.id,
                            );
                            if (!entry) return null;

                            return (
                              <TimesheetSubCodes
                                key={entry.id}
                                entry={entry}
                                subCode={subCode}
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
      `}
      </style>
    </div>
  );
}
