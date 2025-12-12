"use server";

import { prisma } from "@/prisma/prisma";
import type { TimeEntry, WeekEnding } from "@/types/timesheet.types";
import { validateTimesheetSubmission } from "@/utils/timesheet/timesheet.validation";
import { saveTimesheet } from "./saveTimesheet";

/**
 * Submits the timesheet for the selected week with the provided time entries.
 * @param selectedWeek - the selected week ending for the timesheet
 * @param timeEntries - the time entries to be submitted in the timesheet
 * @returns - an object containing success status, updated status, validation errors or null if failed
 */
const submitTimesheet = async (
  selectedWeek: WeekEnding,
  timeEntries: TimeEntry[],
) => {
  try {
    // Validate timesheet before submission
    const validation = await validateTimesheetSubmission(
      timeEntries,
      new Date(selectedWeek.week_ending),
    );

    if (!validation.isValid) {
      return {
        success: false,
        validationErrors: validation.errors,
        message:
          "Cannot submit timesheet. Please check the following issues and try again.",
      };
    }

    await saveTimesheet(selectedWeek, timeEntries);

    // Update timesheet status to 'submitted'
    const submittedStatus = await prisma.timesheetStatus.findFirst({
      where: { name: "Submitted" },
    });

    if (!submittedStatus) {
      throw new Error("Submitted status not found");
    }

    await prisma.timesheet.updateMany({
      where: { timesheet_week_ending_id: selectedWeek.id },
      data: {
        status_id: submittedStatus.id,
        submitted_at: new Date(),
      },
    });

    return { success: true, status: submittedStatus.name };
  } catch (error: unknown) {
    console.error(
      "Error submitting timesheet:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};

export { submitTimesheet };
