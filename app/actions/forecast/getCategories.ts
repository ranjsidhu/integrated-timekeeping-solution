"use server";

import { prisma } from "@/prisma/prisma";
import type { Category } from "@/types/forecast.types";

/**
 * Fetches all categories from the database.
 * @returns - array of Category objects
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ assignment_type: "asc" }, { category_name: "asc" }],
    });

    return categories.map((c) => ({
      id: c.id,
      category_name: c.category_name,
      assignment_type: c.assignment_type as "Productive" | "Non-Productive",
      description: c.description || "",
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
