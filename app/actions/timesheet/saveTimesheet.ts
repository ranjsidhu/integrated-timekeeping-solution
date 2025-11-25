"use server";

import { prisma } from "@/prisma/prisma";
import type { TimeEntry, WeekEnding } from "@/types/timesheet.types";
import { getSession } from "@/utils/auth/getSession";

const saveTimesheet = async (
  selectedWeek: WeekEnding,
  timeEntries: TimeEntry[],
) => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      throw new Error("Unauthorized: No session found");
    }

    const draftStatus = await prisma.timesheetStatus.findFirst({
      where: { name: "Draft" },
    });

    if (!draftStatus) {
      throw new Error("Draft status not found");
    }

    // Create/Update Timesheet record
    const timesheet = await prisma.timesheet.upsert({
      where: {
        user_id_timesheet_week_ending_id: {
          user_id: Number(session.user.id),
          timesheet_week_ending_id: selectedWeek.id,
        },
      },
      create: {
        status_id: draftStatus.id,
        user_id: Number(session.user.id),
        timesheet_week_ending_id: selectedWeek.id,
      },
      update: {
        status_id: draftStatus.id,
      },
    });

    // Get the week ending date and calculate dates for each day
    const weekEndingDate = new Date(selectedWeek.week_ending);

    // Calculate Monday to Friday dates (week_ending is Friday)
    const getDayDate = (dayOffset: number) => {
      const date = new Date(weekEndingDate);
      date.setDate(date.getDate() - (4 - dayOffset)); // 4 days back from Friday = Monday
      return date;
    };

    const dayDates = {
      mon: getDayDate(0),
      tue: getDayDate(1),
      wed: getDayDate(2),
      thu: getDayDate(3),
      fri: getDayDate(4),
    };

    await prisma.timesheetEntry.deleteMany({
      where: {
        timesheet_id: timesheet.id,
      },
    });

    const entriesToCreate = [];

    for (const entry of timeEntries) {
      // For each day of the week
      const daysOfWeek = ["mon", "tue", "wed", "thu", "fri"] as const;

      for (const day of daysOfWeek) {
        const hours = entry.hours[day];

        // Only create entry if hours > 0
        if (hours >= 0) {
          entriesToCreate.push({
            timesheet_id: timesheet.id,
            bill_code_id: entry.billCodeId,
            work_date: dayDates[day],
            hours: hours ?? 0,
          });
        }
      }
    }

    // Bulk create all entries
    if (entriesToCreate.length > 0) {
      await prisma.timesheetEntry.createMany({
        data: entriesToCreate,
      });
    }

    return timesheet;
  } catch (error: unknown) {
    console.error(
      "Error saving timesheet:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};

export { saveTimesheet };
