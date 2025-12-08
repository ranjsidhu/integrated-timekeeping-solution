"use server";

import type { NewForecastEntry } from "@/app/components/Forecast/AddEntryModal";
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

type UpdateForecastEntryResult = {
  success: boolean;
  error?: string;
};

export async function updateForecastEntry(
  entryId: number,
  entry: NewForecastEntry,
): Promise<UpdateForecastEntryResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the entry belongs to the user's plan
    const existingEntry = await prisma.forecastEntry.findUnique({
      where: { id: entryId },
      include: {
        forecast_plan: true,
      },
    });

    if (!existingEntry) {
      return { success: false, error: "Entry not found" };
    }

    if (existingEntry.forecast_plan.user_id !== Number(session.user.id)) {
      return { success: false, error: "Unauthorized" };
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
      : null;

    // Update forecast entry
    await prisma.forecastEntry.update({
      where: { id: entryId },
      data: {
        category_id: entry.category_id,
        project_id: entry.project_id,
        from_date: fromDate,
        to_date: toDate,
        hours_per_week: entry.hours_per_week,
        potential_extension: potentialExtension,
      },
    });

    // Delete existing weekly breakdowns
    await prisma.forecastWeeklyBreakdown.deleteMany({
      where: { forecast_entry_id: entryId },
    });

    // Check if custom weekly hours were provided
    if (entry.weekly_hours && Object.keys(entry.weekly_hours).length > 0) {
      // Use custom weekly hours
      const weeklyData = Object.entries(entry.weekly_hours).map(
        ([weekIdStr, hours]) => ({
          forecast_entry_id: entryId,
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

      const filteredWeeks = weekEndings.filter((week) => {
        const weekStart = new Date(week.week_ending);
        weekStart.setDate(weekStart.getDate() - 6);
        return toDate >= weekStart && fromDate <= new Date(week.week_ending);
      });

      if (filteredWeeks.length > 0) {
        await prisma.forecastWeeklyBreakdown.createMany({
          data: filteredWeeks.map((week) => ({
            forecast_entry_id: entryId,
            forecast_week_ending_id: week.id,
            hours: entry.hours_per_week,
          })),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating forecast entry:", error);
    return { success: false, error: "Failed to update forecast entry" };
  }
}
