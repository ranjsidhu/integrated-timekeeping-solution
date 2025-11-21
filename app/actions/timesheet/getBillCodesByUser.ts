"use server";

import { prisma } from "@/prisma/prisma";
import type { BillCode } from "@/types/timesheet.types";
import { getSession } from "@/utils/auth/getSession";
import { mapBillCode } from "./mappers";

const getBillCodesByUserByWeek = async (
  weekEndingId: number,
): Promise<BillCode[]> => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      throw new Error("Unauthorized: No session found");
    }

    const billCodes = await prisma.billCode.findMany({
      where: {
        timesheet_entries: {
          some: {
            timesheet: {
              user_id: {
                equals: Number(session.user.id),
              },
              timesheet_week_ending_id: {
                equals: weekEndingId,
              },
            },
          },
        },
      },
      include: {
        work_item: true,
      },
      orderBy: {
        bill_name: "asc",
      },
    });

    return billCodes.map(mapBillCode);
  } catch (error: unknown) {
    console.error(
      "Error fetching bill codes by user:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
};

export { getBillCodesByUserByWeek };
