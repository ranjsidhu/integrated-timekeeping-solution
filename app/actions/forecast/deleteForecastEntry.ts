"use server";

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

type DeleteForecastEntryResult = {
  success: boolean;
  error?: string;
};

export async function deleteForecastEntry(
  entryId: number,
): Promise<DeleteForecastEntryResult> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the entry belongs to the user's plan
    const entry = await prisma.forecastEntry.findUnique({
      where: { id: entryId },
      include: {
        forecast_plan: true,
      },
    });

    if (!entry) {
      return { success: false, error: "Entry not found" };
    }

    if (entry.forecast_plan.user_id !== Number(session.user.id)) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete weekly breakdowns first (cascade should handle this, but explicit is safer)
    await prisma.forecastWeeklyBreakdown.deleteMany({
      where: { forecast_entry_id: entryId },
    });

    // Delete the entry
    await prisma.forecastEntry.delete({
      where: { id: entryId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forecast entry:", error);
    return { success: false, error: "Failed to delete forecast entry" };
  }
}
