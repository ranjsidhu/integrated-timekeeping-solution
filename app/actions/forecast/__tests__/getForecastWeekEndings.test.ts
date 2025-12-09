jest.mock("@/prisma/prisma", () => {
  const mockFindMany = jest.fn();
  return {
    prisma: {
      timesheetWeekEnding: {
        findMany: mockFindMany,
      },
    },
    // export the mock so tests can access it via require()
    __mockFindMany: mockFindMany,
  };
});

import { getForecastWeekEndings } from "@/app/actions/forecast/getForecastWeekEndings";

// Retrieve the mock from the mocked module
const { __mockFindMany: mockFindMany } = require("@/prisma/prisma");

describe("getForecastWeekEndings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps prisma results to WeekEnding array", async () => {
    const sampleDate = new Date("2025-12-07T00:00:00.000Z");
    mockFindMany.mockResolvedValue([{ id: 1, week_ending: sampleDate }]);

    const results = await getForecastWeekEndings();

    expect(mockFindMany).toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 1,
      week_ending: sampleDate,
      status: "Draft",
      label: new Date(sampleDate).toLocaleDateString("en-GB", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    });
  });

  it("returns empty array on error and logs error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const results = await getForecastWeekEndings();

    expect(results).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});
