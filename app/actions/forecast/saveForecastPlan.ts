"use server";

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

type SaveForecastPlanResult = {
  success: boolean;
  error?: string;
};

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
        submitted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!forecastPlan) {
      return { success: false, error: "No draft forecast plan found" };
    }

    //  TODO -  Update the plan (just touch updated_at for now)
    await prisma.forecastPlan.update({
      where: { id: forecastPlan.id },
      data: {
        updated_at: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving forecast plan:", error);
    return { success: false, error: "Failed to save forecast plan" };
  }
}
