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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mapped projects when category exists", async () => {
    const sampleCategory = { id: 2, assignment_type: "Productive" };
    const sampleProject = {
      id: 1,
      project_name: "Test Project",
      is_active: true,
    };

    mockFindUnique.mockResolvedValue(sampleCategory);
    mockFindMany.mockResolvedValue([sampleProject]);

    const results = await searchProjects("Test", 2);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(mockFindMany).toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 1,
      project_name: "Test Project",
      client_name: undefined,
    });
  });

  it("returns empty array when category not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const results = await searchProjects("Nope", 999);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 999 } });
    expect(results).toEqual([]);
  });

  it("returns empty array on project find error and logs error", async () => {
    mockFindUnique.mockResolvedValue({ id: 3, assignment_type: "Productive" });
    mockFindMany.mockRejectedValue(new Error("DB fail"));

    const results = await searchProjects("Term", 3);

    expect(results).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});
