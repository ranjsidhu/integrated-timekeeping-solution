"use server";

import { prisma } from "@/prisma/prisma";
import type { CodeWithWorkItems } from "@/types/timesheet.types";

const getCodesBySearch = async (
  searchTerm: string,
): Promise<CodeWithWorkItems[]> => {
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

    const formattedCodes = codes.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      project_id: c.project_id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      is_system_code: c.is_system_code,
      start_date: c.start_date,
      expiry_date: c.expiry_date,
      work_items: c.work_items.map((wi) => ({
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
    }));

    return formattedCodes;
  } catch (error: unknown) {
    console.error(
      "Error fetching codes by search:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
};

export { getCodesBySearch };
