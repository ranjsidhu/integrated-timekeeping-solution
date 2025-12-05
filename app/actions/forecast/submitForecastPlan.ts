"use server";

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

type SubmitForecastPlanResult = {
  success: boolean;
  status?: string;
  error?: string;
  validationErrors?: Array<{
    weekId: number;
    weekEnding: Date;
    total: number;
  }>;
};

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

    // Calculate weekly totals across all entries
    const weeklyTotals: Record<number, number> = {};

    forecastPlan.forecast_entries.forEach((entry) => {
      entry.weekly_breakdowns.forEach((breakdown) => {
        const weekId = breakdown.forecast_week_ending_id;
        weeklyTotals[weekId] = (weeklyTotals[weekId] || 0) + breakdown.hours;
      });
    });

    // Get all week endings that have hours
    const weeksWithHours = Object.keys(weeklyTotals).map(Number);

    if (weeksWithHours.length === 0) {
      return { success: false, error: "Forecast plan has no hours assigned" };
    }

    // Fetch week ending details for validation errors
    const weekEndings = await prisma.timesheetWeekEnding.findMany({
      where: {
        id: {
          in: weeksWithHours,
        },
      },
    });

    // Validate each week totals exactly 40 hours
    const validationErrors: Array<{
      weekId: number;
      weekEnding: Date;
      total: number;
    }> = [];

    Object.entries(weeklyTotals).forEach(([weekIdStr, total]) => {
      if (total !== 40) {
        const weekId = Number(weekIdStr);
        const week = weekEndings.find((w) => w.id === weekId);

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

    // TODO: Additional validations
    // - Must cover minimum 12 weeks (optional based on requirements)
    // - No gaps in coverage (optional based on requirements)

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
