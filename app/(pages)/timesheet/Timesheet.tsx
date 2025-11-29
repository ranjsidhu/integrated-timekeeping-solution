"use client";

import { useEffect, useState } from "react";
import { getTimesheetByWeekEnding, saveTimesheet } from "@/app/actions";
import {
  Column,
  Grid,
  InlineNotification,
  Tag,
  TimesheetActions,
  TimesheetControls,
} from "@/app/components";
import TimesheetCards from "@/app/components/Timesheet/TimesheetCards";
import { useSelectedWeek } from "@/app/providers";
import type {
  CodeWithWorkItems,
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

type EditingValuesState = Record<string, Partial<Record<DayOfWeek, string>>>;

export default function TimesheetPage({ weekEndings }: TimesheetProps) {
  const { selectedWeek: contextWeek, setSelectedWeek: setContextWeek } =
    useSelectedWeek();

  const initialWeek = contextWeek || weekEndings[0];
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding>(initialWeek);
  const [workItems, setWorkItems] = useState<CodeWithWorkItems["work_items"]>(
    [],
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingValues, setEditingValues] = useState<EditingValuesState>({});
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load timesheet data whenever week changes
  useEffect(() => {
    async function loadTimesheet() {
      setIsLoading(true);

      const pendingCodeStr = localStorage.getItem("pendingCode");
      let pendingWorkItems: CodeWithWorkItems["work_items"] = [];
      let pendingTimeEntries: TimeEntry[] = [];

      if (pendingCodeStr) {
        try {
          const pendingCode = JSON.parse(pendingCodeStr);

          if (pendingCode.work_items?.length) {
            pendingWorkItems = pendingCode.work_items;
            pendingTimeEntries = pendingCode.work_items.map(
              (workItem: (typeof pendingCode.work_items)[0]) => ({
                id: workItem.id.toString(),
                billCodeId: workItem.bill_codes[0].id,
                subCodeId: workItem.id,
                hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
              }),
            );
          }

          localStorage.removeItem("pendingCode");
        } catch (error) {
          console.error("Error processing pending code:", error);
        }
      }

      const result = await getTimesheetByWeekEnding(selectedWeek.id);

      if (result.success && result.data) {
        // Merge pending items with loaded items
        const loadedWorkItems = result.data.workItems;
        const loadedTimeEntries = result.data.timeEntries;

        // Combine and deduplicate
        const existingWorkItemIds = new Set(loadedWorkItems.map((w) => w.id));
        const newPendingWorkItems = pendingWorkItems.filter(
          (w) => !existingWorkItemIds.has(w.id),
        );

        const existingEntryIds = new Set(loadedTimeEntries.map((e) => e.id));
        const newPendingEntries = pendingTimeEntries.filter(
          (e) => !existingEntryIds.has(e.id),
        );

        setWorkItems([...loadedWorkItems, ...newPendingWorkItems]);
        setTimeEntries([...loadedTimeEntries, ...newPendingEntries]);

        if (result.data.hasTimesheet) {
          const idsWithData = result.data.timeEntries
            .filter((entry) => {
              const hours = entry.hours as Record<string, number>;
              return Object.values(hours).some((h) => h > 0);
            })
            .map((entry) => entry.id);
          setExpandedRows(new Set(idsWithData));
        }
      }

      setIsLoading(false);
    }

    loadTimesheet();
  }, [selectedWeek.id]);

  const handleWeekChange = (week: WeekEnding) => {
    setSelectedWeek(week);
    setContextWeek(week);
  };

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

    setTimeEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, hours: { ...e.hours, [day]: num } } : e,
      ),
    );

    setEditingValues((prev) => ({
      ...prev,
      [entryId]: { ...(prev[entryId] ?? {}), [day]: undefined },
    }));
  };

  const toggleExpanded = (id: number) => {
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

  const handleSave = async () => {
    await saveTimesheet(selectedWeek, timeEntries);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSubmit = () => {
    console.log("Submitting timesheet...", { selectedWeek, timeEntries });
  };

  const deleteEntry = (entryId: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    setWorkItems((prev) => prev.filter((wi) => wi.id.toString() !== entryId));
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="w-full bg-slate-50 min-h-full">
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
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

          <TimesheetControls
            selectedWeek={selectedWeek}
            setSelectedWeek={handleWeekChange}
            weekEndings={weekEndings}
          />

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
