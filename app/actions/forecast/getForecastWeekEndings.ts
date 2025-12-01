"use server";

import { prisma } from "@/prisma/prisma";
import type { WeekEnding } from "@/types/timesheet.types";

/**
 * Get the next 12 week endings starting from current week for forecasting
 */
export const getForecastWeekEndings = async (): Promise<WeekEnding[]> => {
  const today = new Date();

  // Get current week and 12 weeks ahead
  const twelveWeeksAhead = new Date();
  twelveWeeksAhead.setDate(twelveWeeksAhead.getDate() + 12 * 7);

  try {
    const weekEndings = await prisma.timesheetWeekEnding.findMany({
      where: {
        week_ending: {
          gte: today,
          lte: twelveWeeksAhead,
        },
      },
      orderBy: { week_ending: "asc" },
      take: 12,
    });

    return weekEndings.map((we) => ({
      id: we.id,
      week_ending: we.week_ending,
      status: "",
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
};
