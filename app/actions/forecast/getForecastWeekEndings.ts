"use server";

import { prisma } from "@/prisma/prisma";
import type { WeekEnding } from "@/types/timesheet.types";

/**
 * Get week endings for forecasting (next 52 weeks to allow for flexible planning)
 */
export async function getForecastWeekEndings(): Promise<WeekEnding[]> {
  const today = new Date();

  // Get current week and 52 weeks ahead (1 year of planning)
  const fiftyTwoWeeksAhead = new Date();
  fiftyTwoWeeksAhead.setDate(fiftyTwoWeeksAhead.getDate() + 52 * 7);

  try {
    const weekEndings = await prisma.timesheetWeekEnding.findMany({
      where: {
        week_ending: {
          gte: today,
          lte: fiftyTwoWeeksAhead,
        },
      },
      orderBy: { week_ending: "asc" },
      take: 52, // Get up to 52 weeks
    });

    return weekEndings.map((we) => ({
      id: we.id,
      week_ending: we.week_ending,
      status: "Draft",
      label: new Date(we.week_ending).toLocaleDateString("en-GB", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    }));
  } catch (error: unknown) {
    console.error(
      "Error fetching forecast week endings:",
      (error as Error).message,
    );
    return [];
  }
}
