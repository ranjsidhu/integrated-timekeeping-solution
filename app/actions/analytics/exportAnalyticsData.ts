"use server";

import { prisma } from "@/prisma/prisma";
import type {
  ExportDataType,
  ForecastActualsExportRow,
  ProjectData,
  ProjectExportRow,
  TeamExportRow,
} from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";
import { withRoleProtection } from "@/utils/auth/routeProtection";

/**
 * Protected export function that checks user authorization
 * This is the public-facing server action that client components should call
 */
export async function getProtectedExportData(
  dataType: ExportDataType,
  weeksToShow: number = 4,
): Promise<TeamExportRow[] | ProjectExportRow[] | ForecastActualsExportRow[]> {
  return withRoleProtection(
    getExportData,
    ["Resource Manager", "Admin"],
    dataType,
    weeksToShow,
  );
}

/**
 * Get formatted data for export based on type
 * This is the internal implementation - should not be called directly from client components
 */
export async function getExportData(
  dataType: ExportDataType,
  weeksToShow: number = 4,
): Promise<TeamExportRow[] | ProjectExportRow[] | ForecastActualsExportRow[]> {
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

    if (dataType === "team") {
      // Export team capacity data
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

      const exportData: TeamExportRow[] = users.map((user) => {
        const row: TeamExportRow = {
          name: user.name,
          email: user.email,
        };

        const weeklyHours: Record<number, number> = {};

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

        weekEndings.forEach((week, index) => {
          const hours = weeklyHours[week.id] || 0;
          const weekLabel = `Week ${index + 1} (${new Date(
            week.week_ending,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })})`;
          row[weekLabel] = hours;
        });

        const totalHours = Object.values(weeklyHours).reduce(
          (sum, h) => sum + h,
          0,
        );
        const avgUtilization =
          weekEndings.length > 0
            ? ((totalHours / (weekEndings.length * 40)) * 100).toFixed(1)
            : "0.0";
        row["Average Utilization %"] = avgUtilization;

        return row;
      });

      return exportData;
    } else if (dataType === "projects") {
      // Export project analytics data
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

      const projectMap = new Map<number, ProjectData>();

      for (const plan of forecastPlans) {
        for (const entry of plan.forecast_entries) {
          if (entry.project) {
            const projectId = entry.project.id;

            if (!projectMap.has(projectId)) {
              projectMap.set(projectId, {
                projectName: entry.project.project_name,
                forecastHours: 0,
                actualHours: 0,
                billableHours: 0,
                nonBillableHours: 0,
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

      for (const timesheet of timesheets) {
        for (const entry of timesheet.timesheet_entries) {
          const project = entry.bill_code.work_item.code.project;
          if (project) {
            const projectId = project.id;

            if (!projectMap.has(projectId)) {
              projectMap.set(projectId, {
                projectName: project.project_name,
                forecastHours: 0,
                actualHours: 0,
                billableHours: 0,
                nonBillableHours: 0,
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

      const exportData: ProjectExportRow[] = Array.from(
        projectMap.values(),
      ).map((project) => {
        const variance = project.actualHours - project.forecastHours;
        const utilizationRate =
          project.forecastHours > 0
            ? (project.billableHours / project.forecastHours) * 100
            : 0;

        return {
          projectName: project.projectName,
          teamSize: project.teamMemberIds.size,
          forecastHours: project.forecastHours,
          actualHours: project.actualHours,
          variance,
          billableHours: project.billableHours,
          nonBillableHours: project.nonBillableHours,
          utilizationRate: Math.round(utilizationRate * 10) / 10,
        };
      });

      return exportData.sort((a, b) => b.forecastHours - a.forecastHours);
    } else if (dataType === "forecast-actuals") {
      // Export forecast vs actuals data
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

      weekEndings.reverse();
      const weekEndingIds = weekEndings.map((w) => w.id);

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

      const forecastByWeek: Record<number, number> = {};
      for (const plan of forecastPlans) {
        for (const entry of plan.forecast_entries) {
          for (const breakdown of entry.weekly_breakdowns) {
            forecastByWeek[breakdown.forecast_week_ending_id] =
              (forecastByWeek[breakdown.forecast_week_ending_id] || 0) +
              breakdown.hours;
          }
        }
      }

      const actualByWeek: Record<number, number> = {};
      for (const timesheet of timesheets) {
        const weekTotal = timesheet.timesheet_entries.reduce(
          (sum, entry) => sum + entry.hours,
          0,
        );
        actualByWeek[timesheet.timesheet_week_ending_id] =
          (actualByWeek[timesheet.timesheet_week_ending_id] || 0) + weekTotal;
      }

      const exportData: ForecastActualsExportRow[] = weekEndings.map(
        (week, index) => {
          const forecast = forecastByWeek[week.id] || 0;
          const actual = actualByWeek[week.id] || 0;
          const variance = actual - forecast;

          return {
            week: `Week ${index + 1}`,
            weekEnding: new Date(week.week_ending).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            forecastHours: forecast,
            actualHours: actual,
            variance,
          };
        },
      );

      return exportData;
    }

    return [];
  } catch (error) {
    console.error("Error getting export data:", error);
    return [];
  }
}
