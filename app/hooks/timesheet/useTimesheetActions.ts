import {
  getTimesheetByWeekEnding,
  saveTimesheet,
  submitTimesheet,
} from "@/app/actions";
import { useNotification } from "@/app/providers";
import type {
  CodeWithWorkItems,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";
import {
  mergeTimeEntries,
  mergeWorkItems,
} from "@/utils/timesheet/timesheet.utils";

export function useTimesheetActions(
  selectedWeek: WeekEnding,
  timeEntries: TimeEntry[],
  setWorkItems: React.Dispatch<
    React.SetStateAction<CodeWithWorkItems["work_items"]>
  >,
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>,
  setTimesheetStatus: (status: string) => void,
) {
  const { addNotification } = useNotification();

  const handleSave = async () => {
    try {
      const result = await saveTimesheet(selectedWeek, timeEntries);
      if (result?.success) {
        setTimesheetStatus(result.status);
      }
      addNotification({
        kind: "success",
        type: "inline",
        title: "Timesheet saved",
        subtitle: "Your changes have been saved successfully",
      });
    } catch (error: unknown) {
      console.error("Error saving timesheet:", (error as Error).message);
      addNotification({
        kind: "error",
        type: "inline",
        title: "Error saving timesheet",
        subtitle: "There was an issue saving your changes. Please try again.",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitTimesheet(selectedWeek, timeEntries);
      if (result?.success) {
        setTimesheetStatus(result.status);
      }
      addNotification({
        kind: "success",
        type: "inline",
        title: "Timesheet submitted",
        subtitle: "Your timesheet has been submitted successfully",
      });
    } catch (error: unknown) {
      console.error("Error submitting timesheet:", (error as Error).message);
      addNotification({
        kind: "error",
        type: "inline",
        title: "Error submitting timesheet",
        subtitle:
          "There was an issue submitting your timesheet. Please try again.",
      });
    }
  };

  const handleCopyWeek = async (weekToCopy: WeekEnding) => {
    const result = await getTimesheetByWeekEnding(weekToCopy.id);

    if (result.success && result.data) {
      setWorkItems((prev) => mergeWorkItems(prev, result.data.workItems));

      setTimeEntries((prev) => {
        const newEntries = result.data.timeEntries.map((e) => ({
          ...e,
          hours: e.hours, // Keep hours from previous week
        }));
        return mergeTimeEntries(prev, newEntries);
      });

      addNotification({
        kind: "success",
        type: "inline",
        title: "Week copied",
        subtitle: `Successfully copied timesheet from ${weekToCopy.label}`,
      });
    }
  };

  const deleteEntry = (entryId: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    setWorkItems((prev) => prev.filter((wi) => wi.id.toString() !== entryId));
  };

  return {
    handleSave,
    handleSubmit,
    handleCopyWeek,
    deleteEntry,
  };
}
