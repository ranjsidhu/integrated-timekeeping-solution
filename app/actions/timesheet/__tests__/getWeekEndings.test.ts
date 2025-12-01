// Mock prisma module
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    timesheetWeekEnding: {
      findMany: jest.fn(),
    },
  },
}));

import { getWeekEndings } from "@/app/actions/timesheet/getWeekEndings";
import { prisma } from "@/prisma/prisma";

describe("getWeekEndings", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("returns mapped week endings on success", async () => {
    const now = new Date("2025-11-28T00:00:00Z");
    const dbResult = [
      {
        id: 1,
        week_ending: now,
        timesheets: [{ status: { name: "Submitted" } }],
      },
    ];

    const spy = jest.spyOn(
      prisma.timesheetWeekEnding,
      "findMany",
    ) as unknown as jest.MockedFunction<
      (...args: unknown[]) => Promise<typeof dbResult>
    >;
    spy.mockResolvedValue(dbResult);

    const res = await getWeekEndings();

    expect(prisma.timesheetWeekEnding.findMany).toHaveBeenCalled();
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(1);
    expect(res[0].status).toBe("Submitted");
    // label should be formatted in en-GB as '28 Nov 2025'
    expect(res[0].label).toContain("Nov");
    expect(res[0].label).toContain("2025");
  });

  test("returns empty array on error", async () => {
    const spyErr = jest.spyOn(
      prisma.timesheetWeekEnding,
      "findMany",
    ) as unknown as jest.MockedFunction<(...args: unknown[]) => Promise<never>>;
    spyErr.mockRejectedValue(new Error("db failure"));

    const res = await getWeekEndings();
    expect(res).toEqual([]);
    expect(prisma.timesheetWeekEnding.findMany).toHaveBeenCalled();
  });
});
