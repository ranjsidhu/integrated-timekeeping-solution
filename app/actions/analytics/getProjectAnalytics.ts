"use server";

import { prisma } from "@/prisma/prisma";
import type {
  ProjectAnalytics,
  ProjectAnalyticsData,
} from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";

/**
 * Get project-level analytics data
 * @param weeksToShow - Number of weeks to analyze (default 4)
 */
export async function getProjectAnalytics(
  weeksToShow: number = 4,
): Promise<ProjectAnalytics[]> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return [];
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
      return [];
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

    const historicalWeekIds = historicalWeeks.map((w) => w.id);

    // Get all forecast data for team
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
            project: true,
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

    // Get historical timesheet data mapped to projects
    const timesheets = await prisma.timesheet.findMany({
      where: {
        user_id: {
          in: teamUserIds,
        },
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

    // Aggregate data by project
    const projectMap = new Map<number, ProjectAnalyticsData>();

    // Process forecast data
    for (const plan of forecastPlans) {
      for (const entry of plan.forecast_entries) {
        if (entry.project) {
          const projectId = entry.project.id;

          if (!projectMap.has(projectId)) {
            projectMap.set(projectId, {
              projectId,
              projectName: entry.project.project_name,
              forecastHours: 0,
              actualHours: 0,
              billableHours: 0,
              nonBillableHours: 0,
              teamMemberCount: 0,
              teamMemberIds: new Set<number>(),
            });
          }

          const project = projectMap.get(projectId);
          if (project) {
            project.teamMemberIds.add(plan.user_id);

            const totalHours = entry.weekly_breakdowns.reduce(
              (sum, b) => sum + b.hours,
              0,
            );
            project.forecastHours += totalHours;

            if (entry.category.category_name === "Billable") {
              project.billableHours += totalHours;
            } else {
              project.nonBillableHours += totalHours;
            }
          }
        }
      }
    }

    // Process actual timesheet data
    for (const timesheet of timesheets) {
      for (const entry of timesheet.timesheet_entries) {
        const project = entry.bill_code.work_item.code.project;
        if (project) {
          const projectId = project.id;

          if (!projectMap.has(projectId)) {
            projectMap.set(projectId, {
              projectId,
              projectName: project.project_name,
              forecastHours: 0,
              actualHours: 0,
              billableHours: 0,
              nonBillableHours: 0,
              teamMemberCount: 0,
              teamMemberIds: new Set<number>(),
            });
          }

          const projectData = projectMap.get(projectId);
          if (projectData) {
            projectData.actualHours += entry.hours;
            projectData.teamMemberIds.add(timesheet.user_id);
          }
        }
      }
    }

    // Convert to array and calculate final metrics
    const projectAnalytics: ProjectAnalytics[] = Array.from(
      projectMap.values(),
    ).map((project) => {
      const variance = project.actualHours - project.forecastHours;
      const utilizationRate =
        project.forecastHours > 0
          ? (project.billableHours / project.forecastHours) * 100
          : 0;

      return {
        projectId: project.projectId,
        projectName: project.projectName,
        forecastHours: project.forecastHours,
        actualHours: project.actualHours,
        variance,
        billableHours: project.billableHours,
        nonBillableHours: project.nonBillableHours,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        teamMemberCount: project.teamMemberIds.size,
      };
    });

    // Sort by forecast hours descending
    return projectAnalytics.sort((a, b) => b.forecastHours - a.forecastHours);
  } catch (error) {
    console.error("Error fetching project analytics:", error);
    return [];
  }
}
