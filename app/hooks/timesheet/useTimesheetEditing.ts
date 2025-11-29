import { useState } from "react";
import type { DayOfWeek, TimeEntry } from "@/types/timesheet.types";

type EditingValuesState = Record<string, Partial<Record<DayOfWeek, string>>>;

export function useTimesheetEditing(
  timeEntries: TimeEntry[],
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>,
) {
  const [editingValues, setEditingValues] = useState<EditingValuesState>({});

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
