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

/**
 * Hook providing actions for timesheet management.
 * @param selectedWeek - the selected week ending for the timesheet
 * @param timeEntries - the current time entries in the timesheet
 * @param setWorkItems - function to set work items
 * @param setTimeEntries - function to set time entries
 * @param setTimesheetStatus - function to set the timesheet status
 * @returns - an object with handlers for saving, submitting, copying weeks, and deleting entries
 */
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

  /**
   * Handles saving the timesheet.
   * @returns - void
   */
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

  /**
   * Handles submitting the timesheet.
   * @returns - void
   */
  const handleSubmit = async () => {
    try {
      const result = await submitTimesheet(selectedWeek, timeEntries);

      if (!result) {
        addNotification({
          kind: "error",
          type: "inline",
          title: "Error submitting timesheet",
          subtitle:
            "There was an issue submitting your timesheet. Please try again.",
        });
        return;
      }

      // Check for validation errors
      if (!result.success && result.validationErrors) {
        addNotification({
          kind: "error",
          type: "inline",
          title: "Timesheet validation failed",
          subtitle: result.message || "Please fix the errors below:",
        });

        // Add individual error notifications for each validation error
        result.validationErrors.forEach((error) => {
          addNotification({
            kind: "error",
            type: "inline",
            title: error.message,
            subtitle: error.message,
          });
        });
        return;
      }

      if (result.success) {
        setTimesheetStatus(result.status || "Submitted");
        addNotification({
          kind: "success",
          type: "inline",
          title: "Timesheet submitted",
          subtitle: "Your timesheet has been submitted successfully",
        });
      }
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

  /**
   * Handles copying a previous week's timesheet data.
   * @param weekToCopy - the week ending to copy from
   * @returns - void
   */
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

      setTimesheetStatus(result.data.status);

      addNotification({
        kind: "success",
        type: "inline",
        title: "Week copied",
        subtitle: `Successfully copied timesheet from ${weekToCopy.label}`,
      });
    }
  };

  /**
   * Deletes a time entry and its associated work item.
   * @param entryId - the ID of the time entry to delete
   * @returns - void
   */
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
