"use server";

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

type SubmitForecastPlanResult = {
  success: boolean;
  status?: string;
  error?: string;
};

export async function submitForecastPlan(): Promise<SubmitForecastPlanResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = Number(session.user.id);

    // Get the draft forecast plan
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

    // TODO: Add validation
    // - Must cover minimum 12 weeks
    // - Weekly totals must not exceed 40 hours
    // - No gaps in coverage

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
