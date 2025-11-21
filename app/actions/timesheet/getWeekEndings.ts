"use server";

import { prisma } from "@/prisma/prisma";
import type { WeekEnding } from "@/types/timesheet.types";

export const getWeekEndings = async (): Promise<WeekEnding[]> => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 14);

  try {
    const weekEndings = await prisma.timesheetWeekEnding.findMany({
      where: {
        week_ending: {
          lte: nextWeek,
        },
      },
      orderBy: { week_ending: "desc" },
      include: {
        timesheets: {
          select: {
            status: true,
          },
        },
      },
    });

    return weekEndings.map((we) => ({
      id: we.id,
      week_ending: we.week_ending,
      status: we.timesheets[0]?.status?.name || "Draft",
      label: new Date(we.week_ending).toLocaleDateString("en-GB", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    }));
  } catch (error: unknown) {
    console.error("Error fetching week endings:", (error as Error).message);
    return [];
  }
};
