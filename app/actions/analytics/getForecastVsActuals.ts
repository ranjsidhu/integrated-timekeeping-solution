"use server";

import { prisma } from "@/prisma/prisma";
import type { ForecastVsActualsData } from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";

/**
 * Get forecast vs actual hours comparison for the team
 * @param weeksToShow - Number of weeks to analyze (default 4)
 */
export async function getForecastVsActuals(
  weeksToShow: number = 4,
): Promise<ForecastVsActualsData> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        weekEndings: [],
        forecastHours: [],
        actualHours: [],
        variance: [],
      };
    }

    const currentUserId = Number(session.user.id);

    // Get managed users
    const managedUsers = await prisma.userResourceManagers.findMany({
      where: {
        rm_user_id: currentUserId,
      },
      select: {
        user_id: true,
      },
    });

    const teamUserIds = managedUsers.map((m) => m.user_id);

    if (teamUserIds.length === 0) {
      return {
        weekEndings: [],
        forecastHours: [],
        actualHours: [],
        variance: [],
      };
    }

    // Get the last N weeks (historical data)
    const weekEndings = await prisma.timesheetWeekEnding.findMany({
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

    // Reverse to get chronological order
    weekEndings.reverse();
    const weekEndingIds = weekEndings.map((w) => w.id);

    // Get forecast data
    const forecastPlans = await prisma.forecastPlan.findMany({
      where: {
        user_id: {
          in: teamUserIds,
        },
        submitted_at: {
          not: null,
        },
      },
      include: {
        forecast_entries: {
          include: {
            weekly_breakdowns: {
              where: {
                forecast_week_ending_id: {
                  in: weekEndingIds,
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
        user_id: {
          in: teamUserIds,
        },
        timesheet_week_ending_id: {
          in: weekEndingIds,
        },
      },
      include: {
        timesheet_entries: true,
      },
    });

    // Calculate forecast hours per week
    const forecastByWeek: Record<number, number> = {};
    forecastPlans.forEach((plan) => {
      plan.forecast_entries.forEach((entry) => {
        entry.weekly_breakdowns.forEach((breakdown) => {
          forecastByWeek[breakdown.forecast_week_ending_id] =
            (forecastByWeek[breakdown.forecast_week_ending_id] || 0) +
            breakdown.hours;
        });
      });
    });

    // Calculate actual hours per week
    const actualByWeek: Record<number, number> = {};
    timesheets.forEach((timesheet) => {
      const weekTotal = timesheet.timesheet_entries.reduce(
        (sum, entry) => sum + entry.hours,
        0,
      );
      actualByWeek[timesheet.timesheet_week_ending_id] =
        (actualByWeek[timesheet.timesheet_week_ending_id] || 0) + weekTotal;
    });

    // Build arrays for chart
    const forecastHours = weekEndingIds.map((id) => forecastByWeek[id] || 0);
    const actualHours = weekEndingIds.map((id) => actualByWeek[id] || 0);
    const variance = weekEndingIds.map(
      (_id, index) => actualHours[index] - forecastHours[index],
    );

    return {
      weekEndings: weekEndings.map((w, index) => ({
        id: w.id,
        week_ending: w.week_ending,
        label: `W${index + 1}`,
      })),
      forecastHours,
      actualHours,
      variance,
    };
  } catch (error) {
    console.error("Error fetching forecast vs actuals:", error);
    return {
      weekEndings: [],
      forecastHours: [],
      actualHours: [],
      variance: [],
    };
  }
}
