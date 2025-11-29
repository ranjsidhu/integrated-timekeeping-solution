"use server";

import { prisma } from "@/prisma/prisma";
import type { DayOfWeek } from "@/types/timesheet.types";
import { getSession } from "@/utils/auth/getSession";

export async function getTimesheetByWeekEnding(weekEndingId: number) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = Number(session.user.id);

    // Fetch timesheet with all related data
    const timesheet = await prisma.timesheet.findUnique({
      where: {
        user_id_timesheet_week_ending_id: {
          user_id: userId,
          timesheet_week_ending_id: weekEndingId,
        },
      },
      include: {
        status: true,
        week_ending: true,
        timesheet_entries: {
          include: {
            bill_code: {
              include: {
                work_item: {
                  include: {
                    code: {
                      include: {
                        project: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { work_date: "asc" },
        },
      },
    });

    // No timesheet exists - return empty state
    if (!timesheet) {
      return {
        success: true,
        data: {
          hasTimesheet: false,
          workItems: [],
          timeEntries: [],
          status: "Draft",
        },
      };
    }

    // Build work items from timesheet entries
    const workItemsMap = new Map();
    const timeEntriesMap = new Map();

    for (const entry of timesheet.timesheet_entries) {
      const workItem = entry.bill_code.work_item;
      const workItemId = workItem.id;

      // Add work item if not already in map
      if (!workItemsMap.has(workItemId)) {
        workItemsMap.set(workItemId, {
          id: workItem.id,
          code_id: workItem.code_id,
          work_item_code: workItem.work_item_code,
          description: workItem.description,
          bill_codes: [
            {
              id: entry.bill_code.id,
              work_item_id: entry.bill_code.work_item_id,
              bill_code: entry.bill_code.bill_code,
              bill_name: entry.bill_code.bill_name,
            },
          ],
        });
      }

      // Build time entry with hours per day
      if (!timeEntriesMap.has(workItemId)) {
        timeEntriesMap.set(workItemId, {
          id: workItemId.toString(),
          billCodeId: entry.bill_code_id,
          subCodeId: workItemId,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        });
      }

      const timeEntry = timeEntriesMap.get(workItemId);
      const workDate = new Date(entry.work_date);
      const dayOfWeek = workDate.getDay();

      const dayMap: Record<number, DayOfWeek> = {
        1: "mon",
        2: "tue",
        3: "wed",
        4: "thu",
        5: "fri",
      };

      const dayKey = dayMap[dayOfWeek];
      if (dayKey) {
        timeEntry.hours[dayKey] = entry.hours;
      }
    }

    const totalHours = timesheet.timesheet_entries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );

    return {
      success: true,
      data: {
        hasTimesheet: true,
        timesheetId: timesheet.id,
        workItems: Array.from(workItemsMap.values()),
        timeEntries: Array.from(timeEntriesMap.values()),
        status: timesheet.status.name,
        submittedAt: timesheet.submitted_at,
        totalHours,
      },
    };
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return { success: false, error: "Failed to fetch timesheet" };
  }
}
