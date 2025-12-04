/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { updateForecastEntry } from "../updateForecastEntry";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    forecastEntry: { findUnique: jest.fn(), update: jest.fn() },
    forecastWeeklyBreakdown: { deleteMany: jest.fn(), createMany: jest.fn() },
    timesheetWeekEnding: { findMany: jest.fn() },
  },
}));

jest.mock("@/utils/auth/getSession");

describe("updateForecastEntry", () => {
  const mockPrisma = prisma as unknown as {
    forecastEntry: { findUnique: jest.Mock; update: jest.Mock };
    forecastWeeklyBreakdown: { deleteMany: jest.Mock; createMany: jest.Mock };
    timesheetWeekEnding: { findMany: jest.Mock };
  };
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockGetSession.mockResolvedValue(null as any);

    const result = await updateForecastEntry(1, {} as any);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockPrisma.forecastEntry.findUnique).not.toHaveBeenCalled();
  });

  it("returns entry not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    mockPrisma.forecastEntry.findUnique.mockResolvedValue(null);

    const result = await updateForecastEntry(1, {} as any);

    expect(result).toEqual({ success: false, error: "Entry not found" });
  });

  it("returns unauthorized when entry belongs to another user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    mockPrisma.forecastEntry.findUnique.mockResolvedValue({
      id: 1,
      forecast_plan: { user_id: 9 },
    } as any);

    const result = await updateForecastEntry(1, {} as any);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("updates entry and recreates weekly breakdowns", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    const fromDate = new Date(2025, 0, 1);
    const toDate = new Date(2025, 0, 31);
    mockPrisma.forecastEntry.findUnique.mockResolvedValue({
      id: 1,
      forecast_plan: { user_id: 5 },
    } as any);

    mockPrisma.timesheetWeekEnding.findMany.mockResolvedValue([
      { id: 101, week_ending: new Date(2025, 0, 5) } as any,
      { id: 102, week_ending: new Date(2025, 0, 12) } as any,
    ]);

    mockPrisma.forecastWeeklyBreakdown.createMany.mockResolvedValue({
      count: 2,
    } as any);

    const entry = {
      category_id: 2,
      project_id: 3,
      from_date: [fromDate],
      to_date: [toDate],
      hours_per_week: 8,
    } as any;

    const result = await updateForecastEntry(1, entry);

    expect(result).toEqual({ success: true });
    expect(mockPrisma.forecastEntry.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        category_id: 2,
        project_id: 3,
        from_date: fromDate,
        to_date: toDate,
        hours_per_week: 8,
      }),
    });

    expect(mockPrisma.forecastWeeklyBreakdown.deleteMany).toHaveBeenCalledWith({
      where: { forecast_entry_id: 1 },
    });

    expect(mockPrisma.forecastWeeklyBreakdown.createMany).toHaveBeenCalledWith({
      data: [
        { forecast_entry_id: 1, forecast_week_ending_id: 101, hours: 8 },
        { forecast_entry_id: 1, forecast_week_ending_id: 102, hours: 8 },
      ],
    });
  });

  it("handles errors and returns failure", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    mockPrisma.forecastEntry.findUnique.mockRejectedValue(
      new Error("DB error"),
    );

    const result = await updateForecastEntry(1, {} as any);

    expect(result).toEqual({
      success: false,
      error: "Failed to update forecast entry",
    });
  });
});
