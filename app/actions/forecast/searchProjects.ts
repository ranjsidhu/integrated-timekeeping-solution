"use server";

import { prisma } from "@/prisma/prisma";

export type SearchProjectResponse = {
  id: number;
  project_name: string;
  code?: string;
};

/**
 * Search projects based on category type
 * @param searchTerm - Project name to search for
 * @param categoryId - Category ID to filter projects
 */
export async function searchProjects(
  searchTerm: string,
  categoryId: number,
): Promise<SearchProjectResponse[]> {
  try {
    // Get the category to determine if billable
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { category_name: true },
    });

    if (!category) {
      return [];
    }

    const isBillable = category.category_name === "Billable";

    // Get projects with their codes and bill codes
    const projects = await prisma.project.findMany({
      where: {
        is_active: true,
        OR: [
          {
            project_name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            codes: {
              some: {
                code: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
        // Filter by billable status
        codes: {
          some: {
            work_items: {
              some: {
                bill_codes: {
                  some: {
                    is_billable: isBillable,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        project_name: true,
        codes: {
          select: {
            code: true,
          },
          take: 1,
        },
      },
      orderBy: {
        project_name: "asc",
      },
      take: 20,
    });

    return projects.map((p) => ({
      id: p.id,
      project_name: p.project_name,
      code: p.codes[0]?.code,
    }));
  } catch (error) {
    console.error("Error searching projects:", error);
    return [];
  }
}
