"use server";

import { prisma } from "@/prisma/prisma";

/**
 * Adds a code along with its associated work items and bill codes to the timesheet.
 * @param codeId - the ID of the code to be added to the timesheet
 * @returns - an object containing success status and either data or error message
 */
export async function addCodeToTimesheet(codeId: number) {
  try {
    const code = await prisma.code.findUnique({
      where: { id: codeId },
      include: {
        work_items: {
          include: {
            bill_codes: true,
          },
        },
      },
    });

    if (!code) {
      return { success: false, error: "Code not found" };
    }

    return {
      success: true,
      data: {
        workItems: code.work_items.map((wi) => ({
          id: wi.id,
          code_id: wi.code_id,
          work_item_code: wi.work_item_code,
          description: wi.description,
          bill_codes: wi.bill_codes.map((bc) => ({
            id: bc.id,
            work_item_id: bc.work_item_id,
            bill_code: bc.bill_code,
            bill_name: bc.bill_name,
          })),
        })),
      },
    };
  } catch (error) {
    console.error("Error adding code:", error);
    return { success: false, error: "Failed to add code" };
  }
}
