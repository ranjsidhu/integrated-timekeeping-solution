"use server";

import { prisma } from "@/prisma/prisma";
import type { SaveForecastPlanResult } from "@/types/forecast.types";
import { getSession } from "@/utils/auth/getSession";

export async function saveForecastPlan(): Promise<SaveForecastPlanResult> {
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
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!forecastPlan) {
      return { success: false, error: "No forecast plan found" };
    }

    await prisma.forecastPlan.update({
      where: { id: forecastPlan.id },
      data: {
        updated_at: new Date(),
        submitted_at: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving forecast plan:", error);
    return { success: false, error: "Failed to save forecast plan" };
  }
}
