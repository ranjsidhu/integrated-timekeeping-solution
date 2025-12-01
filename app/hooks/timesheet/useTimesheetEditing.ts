import { useState } from "react";
import type { DayOfWeek, TimeEntry } from "@/types/timesheet.types";

type EditingValuesState = Record<string, Partial<Record<DayOfWeek, string>>>;

/**
 * Hook for managing timesheet editing state.
 * @param timeEntries - the current time entries in the timesheet
 * @param setTimeEntries - function to set time entries
 * @returns - an object with editing values and handlers for temporary changes and commits
 */
export function useTimesheetEditing(
  timeEntries: TimeEntry[],
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>,
) {
  const [editingValues, setEditingValues] = useState<EditingValuesState>({});

  /**
   * Handles temporary changes to a time entry's hours.
   * @param entryId - the ID of the time entry being edited
   * @param day - the day of the week being edited
   * @param value - the temporary value entered by the user
   * @returns - void
   */
  const handleTempChange = (entryId: string, day: DayOfWeek, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [entryId]: { ...(prev[entryId] ?? {}), [day]: value },
    }));
  };

  /**
   * Commits the edited value to the main time entries state.
   * @param entryId - the ID of the time entry being committed
   * @param day - the day of the week being committed
   * @returns - void
   */
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

  /**
   * Toggles the expanded state of a time entry row.
   * @param id - the ID of the time entry
   * @param setExpandedRows - function to set the expanded rows state
   * @returns - void
   */
  const toggleExpanded = (
    id: number,
    setExpandedRows: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) => {
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

  return {
    editingValues,
    handleTempChange,
    handleCommit,
    toggleExpanded,
  };
}
