import { useEffect, useState } from "react";
import { getTimesheetByWeekEnding } from "@/app/actions";
import type {
  CodeWithWorkItems,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";
import {
  getEntriesWithHours,
  mergeTimeEntries,
  mergeWorkItems,
  processPendingCode,
} from "@/utils/timesheet/timesheet.utils";

/**
 * Hook for managing timesheet data.
 * @param selectedWeek - the selected week ending for the timesheet
 * @param setTimesheetStatus - function to set the timesheet status
 * @returns - an object containing timesheet data and state setters
 */
export function useTimesheetData(
  selectedWeek: WeekEnding,
  setTimesheetStatus: (status: string) => void,
) {
  const [workItems, setWorkItems] = useState<CodeWithWorkItems["work_items"]>(
    [],
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTimesheet() {
      setIsLoading(true);

      // Process pending code from localStorage
      const pending = processPendingCode();

      // Load existing timesheet
      const result = await getTimesheetByWeekEnding(selectedWeek.id);

      if (result.success && result.data) {
        // Merge pending with loaded data
        const mergedWorkItems = mergeWorkItems(
          result.data.workItems,
          pending.workItems,
        );
        const mergedEntries = mergeTimeEntries(
          result.data.timeEntries,
          pending.timeEntries,
        );

        setWorkItems(mergedWorkItems);
        setTimeEntries(mergedEntries);

        // Auto-expand rows with data
        if (result.data.hasTimesheet) {
          const idsWithData = getEntriesWithHours(result.data.timeEntries);
          setExpandedRows(new Set(idsWithData));
        }

        setTimesheetStatus(result.data.status);
      }

      setIsLoading(false);
    }

    loadTimesheet();
  }, [selectedWeek.id, setTimesheetStatus]);

  return {
    workItems,
    timeEntries,
    expandedRows,
    isLoading,
    setWorkItems,
    setTimeEntries,
    setExpandedRows,
  };
}
