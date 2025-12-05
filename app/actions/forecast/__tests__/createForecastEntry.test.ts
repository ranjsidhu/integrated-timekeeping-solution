/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { createForecastEntry } from "../createForecastEntry";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    forecastPlan: { findFirst: jest.fn(), create: jest.fn() },
    forecastEntry: { create: jest.fn() },
    forecastWeeklyBreakdown: { createMany: jest.fn() },
    timesheetWeekEnding: { findMany: jest.fn() },
  },
}));
jest.mock("@/utils/auth/getSession");

describe("createForecastEntry", () => {
  const mockPrisma = prisma as unknown as {
    forecastPlan: { findFirst: jest.Mock; create: jest.Mock };
    forecastEntry: { create: jest.Mock };
    forecastWeeklyBreakdown: { createMany: jest.Mock };
    timesheetWeekEnding: { findMany: jest.Mock };
  };
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized error when session is missing", async () => {
    mockGetSession.mockResolvedValue(null);

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [new Date(2025, 0, 1)],
      to_date: [new Date(2025, 0, 31)],
      hours_per_week: 8,
    } as any;

    const result = await createForecastEntry(entry);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockPrisma.forecastPlan.findFirst).not.toHaveBeenCalled();
  });

  it("returns unauthorized error when user id is missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: null } } as any);

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [new Date(2025, 0, 1)],
      to_date: [new Date(2025, 0, 31)],
      hours_per_week: 8,
    } as any;

    const result = await createForecastEntry(entry);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("creates new forecast plan if none exists", async () => {
    const userId = 123;
    mockGetSession.mockResolvedValue({ user: { id: String(userId) } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue(null);
    mockPrisma.forecastPlan.create.mockResolvedValue({
      id: 1,
      user_id: userId,
      created_at: new Date(),
      submitted_at: null,
    } as any);

    mockPrisma.forecastEntry.create.mockResolvedValue({
      id: 10,
      forecast_plan_id: 1,
      category_id: 1,
      project_id: 1,
      from_date: new Date(2025, 0, 1),
      to_date: new Date(2025, 0, 31),
      hours_per_week: 8,
      potential_extension: null,
    } as any);

    mockPrisma.timesheetWeekEnding.findMany.mockResolvedValue([
      { id: 1, week_ending: new Date(2025, 0, 10) } as any,
      { id: 2, week_ending: new Date(2025, 0, 17) } as any,
    ]);

    mockPrisma.forecastWeeklyBreakdown.createMany.mockResolvedValue({
      count: 2,
    } as any);

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [new Date(2025, 0, 1)],
      to_date: [new Date(2025, 0, 31)],
      hours_per_week: 8,
    } as any;

    const result = await createForecastEntry(entry);

    expect(result).toEqual({ success: true, entryId: 10 });
    expect(mockPrisma.forecastPlan.create).toHaveBeenCalledWith({
      data: { user_id: userId },
    });
  });

  it("uses existing forecast plan when available", async () => {
    const userId = 123;
    const planId = 5;
    mockGetSession.mockResolvedValue({ user: { id: String(userId) } } as any);

    const existingPlan = {
      id: planId,
      user_id: userId,
      created_at: new Date(),
      submitted_at: null,
    };

    mockPrisma.forecastPlan.findFirst.mockResolvedValue(existingPlan as any);
    mockPrisma.forecastEntry.create.mockResolvedValue({
      id: 10,
      forecast_plan_id: planId,
      category_id: 1,
      project_id: 1,
      from_date: new Date(2025, 0, 1),
      to_date: new Date(2025, 0, 31),
      hours_per_week: 8,
      potential_extension: null,
    } as any);

    mockPrisma.timesheetWeekEnding.findMany.mockResolvedValue([
      { id: 1, week_ending: new Date(2025, 0, 10) } as any,
    ]);

    mockPrisma.forecastWeeklyBreakdown.createMany.mockResolvedValue({
      count: 1,
    } as any);

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [new Date(2025, 0, 1)],
      to_date: [new Date(2025, 0, 31)],
      hours_per_week: 8,
    } as any;

    const result = await createForecastEntry(entry);

    expect(result).toEqual({ success: true, entryId: 10 });
    expect(mockPrisma.forecastPlan.create).not.toHaveBeenCalled();
    expect(mockPrisma.forecastEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          forecast_plan_id: planId,
        }),
      }),
    );
  });

  it("creates entry with custom weekly hours", async () => {
    const userId = 123;
    const planId = 5;
    mockGetSession.mockResolvedValue({ user: { id: String(userId) } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: planId,
      user_id: userId,
      created_at: new Date(),
      submitted_at: null,
    } as any);

    mockPrisma.forecastEntry.create.mockResolvedValue({
      id: 10,
      forecast_plan_id: planId,
      category_id: 1,
      project_id: 1,
      from_date: new Date(2025, 0, 1),
      to_date: new Date(2025, 0, 31),
      hours_per_week: 8,
      potential_extension: null,
    } as any);

    mockPrisma.forecastWeeklyBreakdown.createMany.mockResolvedValue({
      count: 2,
    } as any);

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [new Date(2025, 0, 1)],
      to_date: [new Date(2025, 0, 31)],
      hours_per_week: 8,
      weekly_hours: { 1: 10, 2: 15 },
    } as any;

    const result = await createForecastEntry(entry);

    expect(result).toEqual({ success: true, entryId: 10 });
    expect(mockPrisma.forecastWeeklyBreakdown.createMany).toHaveBeenCalledWith({
      data: [
        { forecast_entry_id: 10, forecast_week_ending_id: 1, hours: 10 },
        { forecast_entry_id: 10, forecast_week_ending_id: 2, hours: 15 },
      ],
    });
  });

  it("converts Date array to single date", async () => {
    const userId = 123;
    mockGetSession.mockResolvedValue({ user: { id: String(userId) } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 1,
      user_id: userId,
      created_at: new Date(),
      submitted_at: null,
    } as any);

    const fromDate = new Date(2025, 0, 1);
    const toDate = new Date(2025, 0, 31);

    mockPrisma.forecastEntry.create.mockResolvedValue({
      id: 10,
      forecast_plan_id: 1,
      category_id: 1,
      project_id: 1,
      from_date: fromDate,
      to_date: toDate,
      hours_per_week: 8,
      potential_extension: null,
    } as any);

    mockPrisma.timesheetWeekEnding.findMany.mockResolvedValue([]);
    mockPrisma.forecastWeeklyBreakdown.createMany.mockResolvedValue({
      count: 0,
    } as any);

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [fromDate],
      to_date: [toDate],
      hours_per_week: 8,
    } as any;

    await createForecastEntry(entry);

    expect(mockPrisma.forecastEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          from_date: fromDate,
          to_date: toDate,
        }),
      }),
    );
  });

  it("handles potential extension date", async () => {
    const userId = 123;
    mockGetSession.mockResolvedValue({ user: { id: String(userId) } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 1,
      user_id: userId,
      created_at: new Date(),
      submitted_at: null,
    } as any);

    const extensionDate = new Date(2025, 1, 28);

    mockPrisma.forecastEntry.create.mockResolvedValue({
      id: 10,
      forecast_plan_id: 1,
      category_id: 1,
      project_id: 1,
      from_date: new Date(2025, 0, 1),
      to_date: new Date(2025, 0, 31),
      hours_per_week: 8,
      potential_extension: extensionDate,
    } as any);

    mockPrisma.timesheetWeekEnding.findMany.mockResolvedValue([]);
    mockPrisma.forecastWeeklyBreakdown.createMany.mockResolvedValue({
      count: 0,
    } as any);

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [new Date(2025, 0, 1)],
      to_date: [new Date(2025, 0, 31)],
      hours_per_week: 8,
      potential_extension: [extensionDate],
    } as any;

    await createForecastEntry(entry);

    expect(mockPrisma.forecastEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          potential_extension: extensionDate,
        }),
      }),
    );
  });

  it("handles error and returns error message", async () => {
    const userId = 123;
    mockGetSession.mockResolvedValue({ user: { id: String(userId) } } as any);
    mockPrisma.forecastPlan.findFirst.mockRejectedValue(
      new Error("Database error"),
    );

    const entry = {
      category_id: 1,
      project_id: 1,
      from_date: [new Date(2025, 0, 1)],
      to_date: [new Date(2025, 0, 31)],
      hours_per_week: 8,
    } as any;

    const result = await createForecastEntry(entry);

    expect(result).toEqual({
      success: false,
      error: "Failed to create forecast entry",
    });
  });
});
