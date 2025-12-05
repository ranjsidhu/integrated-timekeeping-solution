jest.mock("@/prisma/prisma", () => {
  const mockFindUnique = jest.fn();
  const mockFindMany = jest.fn();
  return {
    prisma: {
      category: { findUnique: mockFindUnique },
      project: { findMany: mockFindMany },
    },
    __mockFindUnique: mockFindUnique,
    __mockFindMany: mockFindMany,
  };
});

import { searchProjects } from "@/app/actions/forecast/searchProjects";

const {
  __mockFindUnique: mockFindUnique,
  __mockFindMany: mockFindMany,
} = require("@/prisma/prisma");

describe("searchProjects", () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns mapped projects when category exists", async () => {
    mockFindUnique.mockResolvedValue({ category_name: "Billable" });
    mockFindMany.mockResolvedValue([
      { id: 1, project_name: "Test Project", codes: [{ code: "ABC" }] },
    ]);

    const results = await searchProjects("Test", 2);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      select: { category_name: true },
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        is_active: true,
        OR: [
          { project_name: { contains: "Test", mode: "insensitive" } },
          {
            codes: {
              some: { code: { contains: "Test", mode: "insensitive" } },
            },
          },
        ],
        codes: {
          some: {
            work_items: {
              some: {
                bill_codes: {
                  some: { is_billable: true },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        project_name: true,
        codes: { select: { code: true }, take: 1 },
      },
      orderBy: { project_name: "asc" },
      take: 20,
    });
    expect(results).toEqual([
      { id: 1, project_name: "Test Project", code: "ABC" },
    ]);
  });

  it("returns empty array when category not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const results = await searchProjects("Nope", 999);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 999 },
      select: { category_name: true },
    });
    expect(results).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns empty array on project find error and logs error", async () => {
    mockFindUnique.mockResolvedValue({ category_name: "Billable" });
    mockFindMany.mockRejectedValue(new Error("DB fail"));

    const results = await searchProjects("Term", 3);

    expect(results).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
