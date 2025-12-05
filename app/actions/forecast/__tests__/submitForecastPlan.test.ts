/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { submitForecastPlan } from "../submitForecastPlan";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    forecastPlan: { findFirst: jest.fn(), update: jest.fn() },
    timesheetWeekEnding: { findMany: jest.fn() },
  },
}));

jest.mock("@/utils/auth/getSession");

describe("submitForecastPlan", () => {
  const mockPrisma = prisma as unknown as {
    forecastPlan: { findFirst: jest.Mock; update: jest.Mock };
    timesheetWeekEnding: { findMany: jest.Mock };
  };
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized when session missing", async () => {
    mockGetSession.mockResolvedValue(null as any);

    const result = await submitForecastPlan();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockPrisma.forecastPlan.findFirst).not.toHaveBeenCalled();
  });

  it("returns unauthorized when user id missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: null } } as any);

    const result = await submitForecastPlan();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when no draft forecast plan found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "11" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue(null);

    const result = await submitForecastPlan();

    expect(result).toEqual({
      success: false,
      error: "No draft forecast plan found",
    });
    expect(mockPrisma.forecastPlan.update).not.toHaveBeenCalled();
  });

  it("returns error when forecast plan has no entries", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "11" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 4,
      forecast_entries: [],
    } as any);

    const result = await submitForecastPlan();

    expect(result).toEqual({
      success: false,
      error: "Cannot submit an empty forecast plan",
    });
    expect(mockPrisma.forecastPlan.update).not.toHaveBeenCalled();
  });

  it("returns error when forecast plan has no hours assigned", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "11" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 4,
      forecast_entries: [
        {
          id: 1,
          weekly_breakdowns: [],
        },
      ],
    } as any);

    const result = await submitForecastPlan();

    expect(result).toEqual({
      success: false,
      error: "Forecast plan has no hours assigned",
    });
    expect(mockPrisma.forecastPlan.update).not.toHaveBeenCalled();
  });

  it("returns validation errors when weekly totals don't equal 40", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "11" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 4,
      forecast_entries: [
        {
          id: 1,
          weekly_breakdowns: [
            { forecast_week_ending_id: 1, hours: 32 },
            { forecast_week_ending_id: 2, hours: 45 },
          ],
        },
      ],
    } as any);

    mockPrisma.timesheetWeekEnding.findMany.mockResolvedValue([
      { id: 1, week_ending: new Date("2025-12-05") },
      { id: 2, week_ending: new Date("2025-12-12") },
    ] as any);

    const result = await submitForecastPlan();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Weekly hours validation failed");
    expect(result.validationErrors).toHaveLength(2);
    expect(result.validationErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ weekId: 1, total: 32 }),
        expect.objectContaining({ weekId: 2, total: 45 }),
      ]),
    );
    expect(mockPrisma.forecastPlan.update).not.toHaveBeenCalled();
  });

  it("submits forecast plan and returns status when validation passes", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "11" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 4,
      forecast_entries: [
        {
          id: 1,
          weekly_breakdowns: [
            { forecast_week_ending_id: 1, hours: 32 },
            { forecast_week_ending_id: 2, hours: 40 },
          ],
        },
        {
          id: 2,
          weekly_breakdowns: [
            { forecast_week_ending_id: 1, hours: 8 }, // 32 + 8 = 40
          ],
        },
      ],
    } as any);

    mockPrisma.timesheetWeekEnding.findMany.mockResolvedValue([
      { id: 1, week_ending: new Date("2025-12-05") },
      { id: 2, week_ending: new Date("2025-12-12") },
    ] as any);

    mockPrisma.forecastPlan.update.mockResolvedValue({
      id: 4,
      submitted_at: new Date(),
    } as any);

    const result = await submitForecastPlan();

    expect(result).toEqual({ success: true, status: "Submitted" });
    expect(mockPrisma.forecastPlan.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: expect.objectContaining({ submitted_at: expect.any(Date) }),
    });
  });

  it("handles errors and returns failure", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "11" } } as any);
    mockPrisma.forecastPlan.findFirst.mockRejectedValue(new Error("DB error"));

    const result = await submitForecastPlan();

    expect(result).toEqual({
      success: false,
      error: "Failed to submit forecast plan",
    });
  });
});
