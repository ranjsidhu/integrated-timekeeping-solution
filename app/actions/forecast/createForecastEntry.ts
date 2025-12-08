"use server";

import type { NewForecastEntry } from "@/app/components/Forecast/AddEntryModal";
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

type CreateForecastEntryResult = {
  success: boolean;
  entryId?: number;
  error?: string;
};

export async function createForecastEntry(
  entry: NewForecastEntry,
): Promise<CreateForecastEntryResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = Number(session.user.id);

    // Get or create active draft forecast plan
    let forecastPlan = await prisma.forecastPlan.findFirst({
      where: {
        user_id: userId,
        submitted_at: null, // Draft plans have no submitted_at
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Create new plan if none exists
    if (!forecastPlan) {
      forecastPlan = await prisma.forecastPlan.create({
        data: {
          user_id: userId,
        },
      });
    }

    // Convert Date arrays to single Date objects
    const fromDate = Array.isArray(entry.from_date)
      ? entry.from_date[0]
      : entry.from_date;
    const toDate = Array.isArray(entry.to_date)
      ? entry.to_date[0]
      : entry.to_date;
    const potentialExtension = entry.potential_extension
      ? Array.isArray(entry.potential_extension)
        ? entry.potential_extension[0]
        : entry.potential_extension
      : undefined;

    // Create forecast entry
    const forecastEntry = await prisma.forecastEntry.create({
      data: {
        forecast_plan_id: forecastPlan.id,
        category_id: entry.category_id,
        project_id: entry.project_id,
        from_date: fromDate,
        to_date: toDate,
        hours_per_week: entry.hours_per_week,
        potential_extension: potentialExtension || null,
      },
    });

    // Check if custom weekly hours were provided
    if (entry.weekly_hours && Object.keys(entry.weekly_hours).length > 0) {
      // Use custom weekly hours
      const weeklyData = Object.entries(entry.weekly_hours).map(
        ([weekIdStr, hours]) => ({
          forecast_entry_id: forecastEntry.id,
          forecast_week_ending_id: Number(weekIdStr),
          hours: hours,
        }),
      );

      if (weeklyData.length > 0) {
        await prisma.forecastWeeklyBreakdown.createMany({
          data: weeklyData,
        });
      }
    } else {
      // Use default hours_per_week for all weeks in range
      const weekEndings = await prisma.timesheetWeekEnding.findMany({
        where: {
          week_ending: {
            gte: fromDate,
          },
        },
        orderBy: {
          week_ending: "asc",
        },
      });

      // Filter to only include weeks where to_date falls within or before the week
      const filteredWeeks = weekEndings.filter((week) => {
        // A week ending on 'week_ending' starts 6 days before
        const weekStart = new Date(week.week_ending);
        weekStart.setDate(weekStart.getDate() - 6);

        // Include this week only if the date range overlaps with the week
        return toDate >= weekStart && fromDate <= new Date(week.week_ending);
      });

      // Create weekly breakdown entries ONLY for weeks in the date range
      if (filteredWeeks.length > 0) {
        await prisma.forecastWeeklyBreakdown.createMany({
          data: filteredWeeks.map((week) => ({
            forecast_entry_id: forecastEntry.id,
            forecast_week_ending_id: week.id,
            hours: entry.hours_per_week,
          })),
        });
      }
    }

    return { success: true, entryId: forecastEntry.id };
  } catch (error) {
    console.error("Error creating forecast entry:", error);
    return { success: false, error: "Failed to create forecast entry" };
  }
}
