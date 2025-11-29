"use server";

import { prisma } from "@/prisma/prisma";
import type { TimeEntry, WeekEnding } from "@/types/timesheet.types";
import { saveTimesheet } from "./saveTimesheet";

const submitTimesheet = async (
  selectedWeek: WeekEnding,
  timeEntries: TimeEntry[],
) => {
  try {
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
