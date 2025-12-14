"use server";

import { prisma } from "@/prisma/prisma";
import type { SubmitForecastPlanResult } from "@/types/forecast.types";
import { getSession } from "@/utils/auth/getSession";

export async function submitForecastPlan(): Promise<SubmitForecastPlanResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = Number(session.user.id);

    // Get the draft forecast plan with all entries and breakdowns
    const forecastPlan = await prisma.forecastPlan.findFirst({
      where: {
        user_id: userId,
        submitted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        forecast_entries: {
          include: {
            weekly_breakdowns: true,
          },
        },
      },
    });

    if (!forecastPlan) {
      return { success: false, error: "No draft forecast plan found" };
    }

    if (forecastPlan.forecast_entries.length === 0) {
      return { success: false, error: "Cannot submit an empty forecast plan" };
    }

    // Get the first 12 week endings (the visible weeks)
    const allWeekEndings = await prisma.timesheetWeekEnding.findMany({
      orderBy: {
        week_ending: "asc",
      },
      take: 12,
    });

    const visibleWeekIds = new Set(allWeekEndings.map((w) => w.id));

    // Calculate weekly totals across all entries (only for visible weeks)
    const weeklyTotals: Record<number, number> = {};

    forecastPlan.forecast_entries.forEach((entry) => {
      entry.weekly_breakdowns.forEach((breakdown) => {
        const weekId = breakdown.forecast_week_ending_id;
        // Only count hours for visible weeks
        if (visibleWeekIds.has(weekId)) {
          weeklyTotals[weekId] = (weeklyTotals[weekId] || 0) + breakdown.hours;
        }
      });
    });

    // Get all week endings that have hours (from visible weeks)
    const weeksWithHours = Object.keys(weeklyTotals).map(Number);

    if (weeksWithHours.length === 0) {
      return { success: false, error: "Forecast plan has no hours assigned" };
    }

    // Validate each week totals exactly 40 hours (only visible weeks)
    const validationErrors: Array<{
      weekId: number;
      weekEnding: Date;
      total: number;
    }> = [];

    Object.entries(weeklyTotals).forEach(([weekIdStr, total]) => {
      if (total !== 40) {
        const weekId = Number(weekIdStr);
        const week = allWeekEndings.find((w) => w.id === weekId);

        if (week) {
          validationErrors.push({
            weekId,
            weekEnding: week.week_ending,
            total,
          });
        }
      }
    });

    // If validation fails, return errors
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: "Weekly hours validation failed",
        validationErrors,
      };
    }

    // Submit the plan
    await prisma.forecastPlan.update({
      where: { id: forecastPlan.id },
      data: {
        submitted_at: new Date(),
      },
    });

    return { success: true, status: "Submitted" };
  } catch (error) {
    console.error("Error submitting forecast plan:", error);
    return { success: false, error: "Failed to submit forecast plan" };
  }
}
