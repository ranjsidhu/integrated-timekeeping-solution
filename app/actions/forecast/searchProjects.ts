"use server";

import { prisma } from "@/prisma/prisma";
import type { Project } from "@/types/forecast.types";

/**
 * Searches for projects based on a search term and category ID.
 * @param searchTerm - term to search project names
 * @param categoryId - category ID to filter projects
 * @returns - array of matching projects
 */
export async function searchProjects(
  searchTerm: string,
  categoryId: number,
): Promise<Project[]> {
  try {
    // Get category to determine if productive or non-productive
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) return [];

    // Search projects based on assignment type
    const projects = await prisma.project.findMany({
      where: {
        project_name: {
          contains: searchTerm,
          mode: "insensitive",
        },
        is_active: true,
      },
      take: 10,
    });

    return projects.map((p) => ({
      id: p.id,
      project_name: p.project_name,
      client_name: undefined, // TODO: Add client relation if needed
    }));
  } catch (error) {
    console.error("Error searching projects:", error);
    return [];
  }
}
