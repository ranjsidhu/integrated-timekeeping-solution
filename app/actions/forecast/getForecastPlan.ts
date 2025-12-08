"use server";

import { prisma } from "@/prisma/prisma";
import type { ForecastEntry } from "@/types/forecast.types";
import { getSession } from "@/utils/auth/getSession";

type GetForecastPlanResult = {
  success: boolean;
  entries?: ForecastEntry[];
  status?: string;
  error?: string;
};

export async function getForecastPlan(): Promise<GetForecastPlanResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = Number(session.user.id);

    // Get the latest forecast plan (submitted or draft)
    const forecastPlan = await prisma.forecastPlan.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        forecast_entries: {
          include: {
            category: true,
            project: true,
            weekly_breakdowns: {
              include: {
                week_ending: true,
              },
            },
          },
        },
      },
    });

    if (!forecastPlan) {
      return { success: true, entries: [], status: "Draft" };
    }

    // Map to ForecastEntry type
    const entries: ForecastEntry[] = forecastPlan.forecast_entries.map(
      (entry) => {
        // Build weekly_hours map from breakdowns
        const weekly_hours: Record<number, number> = {};
        entry.weekly_breakdowns.forEach((breakdown) => {
          weekly_hours[breakdown.forecast_week_ending_id] = breakdown.hours;
        });

        return {
          id: entry.id,
          forecast_plan_id: entry.forecast_plan_id,
          category_id: entry.category_id,
          category_name: entry.category.category_name,
          assignment_type: entry.category.assignment_type,
          project_id: entry.project_id ?? 0,
          project_name: entry.project?.project_name ?? "Unknown",
          from_date: entry.from_date,
          to_date: entry.to_date,
          potential_extension: entry.potential_extension,
          hours_per_week: entry.hours_per_week,
          weekly_hours,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
        };
      },
    );

    const status = forecastPlan.submitted_at ? "Submitted" : "Draft";

    return {
      success: true,
      entries: entries.sort((a, b) =>
        a.project_name.localeCompare(b.project_name),
      ),
      status,
    };
  } catch (error) {
    console.error("Error fetching forecast plan:", error);
    return { success: false, error: "Failed to fetch forecast plan" };
  }
}
