jest.mock("@/prisma/prisma", () => {
  const mockFindMany = jest.fn();
  return {
    prisma: {
      category: {
        findMany: mockFindMany,
      },
    },
    __mockFindMany: mockFindMany,
  };
});

import { getCategories } from "@/app/actions/forecast/getCategories";

const { __mockFindMany: mockFindMany } = require("@/prisma/prisma");

describe("getCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps prisma results to Category array", async () => {
    const sample = {
      id: 1,
      category_name: "Design",
      assignment_type: "Productive",
      description: null,
    };

    mockFindMany.mockResolvedValue([sample]);

    const results = await getCategories();

    expect(mockFindMany).toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 1,
      category_name: "Design",
      assignment_type: "Productive",
      description: "",
    });
  });

  it("returns empty array on error and logs error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB failure"));

    const results = await getCategories();

    expect(results).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});
