"use server";

import { prisma } from "@/prisma/prisma";
import type { Code } from "@/types/timesheet.types";

// TODO change type so it includes work items and bill codes
// TODO update UI to show work items and bill codes

const getCodesBySearch = async (searchTerm: string): Promise<Code[]> => {
  try {
    const codes = await prisma.code.findMany({
      where: {
        OR: [
          {
            code: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
        expiry_date: { gte: new Date() },
      },
      include: {
        work_items: {
          include: {
            bill_codes: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
      take: 10,
    });

    return codes;
  } catch (error: unknown) {
    console.error(
      "Error fetching codes by search:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
};

export { getCodesBySearch };
