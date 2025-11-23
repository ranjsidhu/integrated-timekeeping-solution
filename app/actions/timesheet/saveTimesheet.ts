"use server";

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

const saveTimesheet = async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      throw new Error("Unauthorized: No session found");
    }
  } catch (error: unknown) {
    console.error(
      "Error saving timesheet:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};

export { saveTimesheet };
