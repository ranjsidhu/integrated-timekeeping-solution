"use server";

import { prisma } from "@/prisma/prisma";
import type {
  IndividualAnalytics,
  ProjectAssignment,
} from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";

/**
 * Get detailed analytics for an individual team member
 * @param userId - User ID to get analytics for
 * @param weeksToShow - Number of weeks to analyze (default 4)
 */
export async function getIndividualAnalytics(
  userId: number,
  weeksToShow: number = 4,
): Promise<IndividualAnalytics | null> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }

    const currentUserId = Number(session.user.id);

    // Verify the current user manages this team member
    const isManaged = await prisma.userResourceManagers.findFirst({
      where: {
        user_id: userId,
        rm_user_id: currentUserId,
      },
    });

    if (!isManaged) {
      return null;
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return null;
    }

    // Get future weeks for forecast
    const futureWeeks = await prisma.timesheetWeekEnding.findMany({
      where: {
        week_ending: {
          gte: new Date(),
        },
      },
      orderBy: {
        week_ending: "asc",
      },
      take: weeksToShow,
    });

    const futureWeekIds = futureWeeks.map((w) => w.id);

    // Get historical weeks for actuals
    const historicalWeeks = await prisma.timesheetWeekEnding.findMany({
      where: {
        week_ending: {
          lte: new Date(),
        },
      },
      orderBy: {
        week_ending: "desc",
      },
      take: weeksToShow,
    });

    historicalWeeks.reverse();
    const historicalWeekIds = historicalWeeks.map((w) => w.id);

    // Get forecast data
    const forecastPlan = await prisma.forecastPlan.findFirst({
      where: {
        user_id: userId,
        submitted_at: {
          not: null,
        },
      },
      orderBy: {
        submitted_at: "desc",
      },
      include: {
        forecast_entries: {
          include: {
            project: true,
            category: true,
            weekly_breakdowns: {
              where: {
                forecast_week_ending_id: {
                  in: futureWeekIds,
                },
              },
            },
          },
        },
      },
    });

    // Get actual timesheet data
    const timesheets = await prisma.timesheet.findMany({
      where: {
        user_id: userId,
        timesheet_week_ending_id: {
          in: historicalWeekIds,
        },
      },
      include: {
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
        },
      },
    });

    // Calculate forecast hours by week
    const forecastByWeek: Record<number, number> = {};
    const forecastBillableByWeek: Record<number, number> = {};
    const projectAssignments = new Map<number, ProjectAssignment>();

    if (forecastPlan) {
      for (const entry of forecastPlan.forecast_entries) {
        for (const breakdown of entry.weekly_breakdowns) {
          forecastByWeek[breakdown.forecast_week_ending_id] =
            (forecastByWeek[breakdown.forecast_week_ending_id] || 0) +
            breakdown.hours;

          if (entry.category.category_name === "Billable") {
            forecastBillableByWeek[breakdown.forecast_week_ending_id] =
              (forecastBillableByWeek[breakdown.forecast_week_ending_id] || 0) +
              breakdown.hours;
          }
        }

        if (entry.project) {
          const projectId = entry.project.id;
          if (!projectAssignments.has(projectId)) {
            projectAssignments.set(projectId, {
              projectId,
              projectName: entry.project.project_name,
              totalHours: 0,
            });
          }
          const project = projectAssignments.get(projectId);
          if (project) {
            const totalHours = entry.weekly_breakdowns.reduce(
              (sum, b) => sum + b.hours,
              0,
            );
            project.totalHours += totalHours;
          }
        }
      }
    }

    // Calculate actual hours by week
    const actualByWeek: Record<number, number> = {};
    const actualBillableByWeek: Record<number, number> = {};

    for (const timesheet of timesheets) {
      let weekTotal = 0;
      let weekBillable = 0;

      for (const entry of timesheet.timesheet_entries) {
        weekTotal += entry.hours;
        if (entry.bill_code.is_billable) {
          weekBillable += entry.hours;
        }
      }

      actualByWeek[timesheet.timesheet_week_ending_id] = weekTotal;
      actualBillableByWeek[timesheet.timesheet_week_ending_id] = weekBillable;
    }

    // Calculate utilization
    const forecastHours = Object.values(forecastByWeek).reduce(
      (sum, h) => sum + h,
      0,
    );
    const forecastBillableHours = Object.values(forecastBillableByWeek).reduce(
      (sum, h) => sum + h,
      0,
    );
    const actualHours = Object.values(actualByWeek).reduce(
      (sum, h) => sum + h,
      0,
    );
    const actualBillableHours = Object.values(actualBillableByWeek).reduce(
      (sum, h) => sum + h,
      0,
    );

    const forecastUtilization =
      futureWeeks.length > 0
        ? (forecastHours / (futureWeeks.length * 40)) * 100
        : 0;

    const actualUtilization =
      historicalWeeks.length > 0
        ? (actualHours / (historicalWeeks.length * 40)) * 100
        : 0;

    const forecastCompliance =
      forecastHours > 0
        ? 100 - Math.abs(((actualHours - forecastHours) / forecastHours) * 100)
        : 100;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      summary: {
        forecastUtilization: Math.round(forecastUtilization * 10) / 10,
        actualUtilization: Math.round(actualUtilization * 10) / 10,
        forecastHours,
        actualHours,
        forecastBillableHours,
        actualBillableHours,
        forecastCompliance: Math.max(
          0,
          Math.round(forecastCompliance * 10) / 10,
        ),
      },
      weeklyData: {
        futureWeeks: futureWeeks.map((w, index) => ({
          id: w.id,
          week_ending: w.week_ending,
          label: `W${index + 1}`,
          forecastHours: forecastByWeek[w.id] || 0,
          forecastBillableHours: forecastBillableByWeek[w.id] || 0,
        })),
        historicalWeeks: historicalWeeks.map((w, index) => ({
          id: w.id,
          week_ending: w.week_ending,
          label: `W${index + 1}`,
          actualHours: actualByWeek[w.id] || 0,
          actualBillableHours: actualBillableByWeek[w.id] || 0,
          forecastHours: 0, // Historical forecast would require more complex query
        })),
      },
      projectAssignments: Array.from(projectAssignments.values()).sort(
        (a, b) => b.totalHours - a.totalHours,
      ),
    };
  } catch (error) {
    console.error("Error fetching individual analytics:", error);
    return null;
  }
}
