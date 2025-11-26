"use server";

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

export async function getTimesheetByWeekEnding(weekEndingId: number) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Fetch timesheet with all related data
    const timesheet = await prisma.timesheet.findUnique({
      where: {
        user_id_timesheet_week_ending_id: {
          user_id: Number(userId),
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
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!timesheet) {
      return { error: "Timesheet not found" };
    }

    // Calculate total hours
    const totalHours = timesheet.timesheet_entries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );

    // Group entries by bill code for summary view
    const billCodeSummary = timesheet.timesheet_entries.reduce(
      (acc, entry) => {
        const billCodeId = entry.bill_code_id;
        if (!acc[billCodeId]) {
          acc[billCodeId] = {
            bill_code: entry.bill_code.bill_code,
            bill_name: entry.bill_code.bill_name,
            work_item_code: entry.bill_code.work_item.work_item_code,
            code: entry.bill_code.work_item.code.code,
            project_name:
              entry.bill_code.work_item.code.project?.project_name || "N/A",
            total_hours: 0,
            daily_breakdown: [],
          };
        }

        acc[billCodeId].total_hours += entry.hours;
        acc[billCodeId].daily_breakdown.push({
          work_date: entry.work_date,
          hours: entry.hours,
        });

        return acc;
      },
      {} as Record<
        string,
        {
          bill_code: string;
          bill_name: string;
          work_item_code: string;
          code: string;
          project_name: string;
          total_hours: number;
          daily_breakdown: { work_date: Date; hours: number }[];
        }
      >,
    );

    /**
     *           setTimeEntries(
            workItems.map((workItem) => ({
              id: workItem.id.toString(),
              billCodeId: workItem.bill_codes[0].id,
              codeId: workItem.code_id,
              subCodeId: workItem.id,
              hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
            })),
          );
     */

    return {
      success: true,
      data: {
        timesheet: {
          id: timesheet.id,
          week_ending: timesheet.week_ending.week_ending,
          status: timesheet.status.name,
          submitted_at: timesheet.submitted_at,
          total_hours: totalHours,
        },
        entries: timesheet.timesheet_entries,
        bill_code_summary: Object.values(billCodeSummary),
      },
    };
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return { error: "Failed to fetch timesheet" };
  }
}
