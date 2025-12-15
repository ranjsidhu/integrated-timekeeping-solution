"use server";

import { prisma } from "@/prisma/prisma";
import type {
  TeamMember,
  TeamUtilizationResult,
} from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";

/**
 * Get team utilization for the next N weeks
 * @param weeksToShow - Number of weeks to display (default 4)
 */
export async function getTeamUtilization(
  weeksToShow: number = 4,
): Promise<TeamUtilizationResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { teamMembers: [], weekEndings: [] };
    }

    const currentUserId = Number(session.user.id);

    // Check if current user is a resource manager
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
      return { teamMembers: [], weekEndings: [] };
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

    // Get all team members with their forecast data
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: teamUserIds,
        },
      },
      include: {
        forecast_plans: {
          where: {
            submitted_at: {
              not: null,
            },
          },
          orderBy: {
            submitted_at: "desc",
          },
          take: 1,
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
        },
      },
    });

    // Transform to TeamMember format
    const teamMembers: TeamMember[] = users.map((user) => {
      const weeklyHours: Record<number, number> = {};

      // Sum up all forecast hours for each week
      const latestPlan = user.forecast_plans[0];
      if (latestPlan) {
        latestPlan.forecast_entries.forEach((entry) => {
          entry.weekly_breakdowns.forEach((breakdown) => {
            weeklyHours[breakdown.forecast_week_ending_id] =
              (weeklyHours[breakdown.forecast_week_ending_id] || 0) +
              breakdown.hours;
          });
        });
      }

      // Calculate average utilization
      const weekHoursArray = weekEndingIds.map((id) => weeklyHours[id] || 0);
      const totalHours = weekHoursArray.reduce((sum, h) => sum + h, 0);
      const averageUtilization =
        weekHoursArray.length > 0
          ? (totalHours / (weekHoursArray.length * 40)) * 100
          : 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        weeklyHours,
        averageUtilization,
      };
    });

    return {
      teamMembers,
      weekEndings: weekEndings.map((w, index) => ({
        id: w.id,
        week_ending: w.week_ending,
        label: `W${index + 1}`,
      })),
    };
  } catch (error) {
    console.error("Error fetching team utilization:", error);
    return { teamMembers: [], weekEndings: [] };
  }
}
