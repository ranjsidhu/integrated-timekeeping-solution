"use server";

import { prisma } from "@/prisma/prisma";
import type { AnalyticsMetrics } from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";

/**
 * Get key analytics metrics for the dashboard
 * @param weeksToShow - Number of weeks to analyze (default 4)
 */
export async function getAnalyticsMetrics(
  weeksToShow: number = 4,
): Promise<AnalyticsMetrics> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        teamUtilization: 0,
        totalBillableHours: 0,
        activeAssignments: 0,
        forecastCompliance: 0,
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
        teamUtilization: 0,
        totalBillableHours: 0,
        activeAssignments: 0,
        forecastCompliance: 0,
      };
    }

    // Get next N weeks
    const weekEndings = await prisma.timesheetWeekEnding.findMany({
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

    const weekEndingIds = weekEndings.map((w) => w.id);

    // Get all forecast plans for team
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
            category: true,
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

    let totalHours = 0;
    let totalBillableHours = 0;
    const activeAssignmentsSet = new Set<number>();

    forecastPlans.forEach((plan) => {
      plan.forecast_entries.forEach((entry) => {
        activeAssignmentsSet.add(entry.id);

        entry.weekly_breakdowns.forEach((breakdown) => {
          totalHours += breakdown.hours;
          if (entry.category.category_name === "Billable") {
            totalBillableHours += breakdown.hours;
          }
        });
      });
    });

    // Calculate team utilization
    const maxPossibleHours = teamUserIds.length * weekEndings.length * 40;
    const teamUtilization =
      maxPossibleHours > 0 ? (totalHours / maxPossibleHours) * 100 : 0;

    // For now, forecast compliance is 100% (we'll calculate this properly when we have actuals)
    const forecastCompliance = 100;

    return {
      teamUtilization: Math.round(teamUtilization * 10) / 10,
      totalBillableHours,
      activeAssignments: activeAssignmentsSet.size,
      forecastCompliance,
    };
  } catch (error) {
    console.error("Error fetching analytics metrics:", error);
    return {
      teamUtilization: 0,
      totalBillableHours: 0,
      activeAssignments: 0,
      forecastCompliance: 0,
    };
  }
}
