/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { getForecastPlan } from "../getForecastPlan";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    forecastPlan: { findFirst: jest.fn() },
  },
}));

jest.mock("@/utils/auth/getSession");

describe("getForecastPlan", () => {
  const mockPrisma = prisma as unknown as {
    forecastPlan: { findFirst: jest.Mock };
  };
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized when session missing", async () => {
    mockGetSession.mockResolvedValue(null as any);

    const result = await getForecastPlan();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockPrisma.forecastPlan.findFirst).not.toHaveBeenCalled();
  });

  it("returns empty draft when no plan exists", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "7" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue(null);

    const result = await getForecastPlan();

    expect(result).toEqual({ success: true, entries: [], status: "Draft" });
  });

  it("maps entries with weekly hours and draft status", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "7" } } as any);

    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 1,
      user_id: 7,
      created_at: new Date(),
      submitted_at: null,
      forecast_entries: [
        {
          id: 10,
          forecast_plan_id: 1,
          category_id: 3,
          category: { category_name: "Cat", assignment_type: "Productive" },
          project_id: 9,
          project: { project_name: "Project X" },
          from_date: new Date(2025, 0, 1),
          to_date: new Date(2025, 0, 7),
          potential_extension: null,
          hours_per_week: 8,
          created_at: new Date(),
          updated_at: new Date(),
          weekly_breakdowns: [
            {
              forecast_week_ending_id: 101,
              hours: 5,
              week_ending: { id: 101, week_ending: new Date(2025, 0, 7) },
            },
            {
              forecast_week_ending_id: 102,
              hours: 7,
              week_ending: { id: 102, week_ending: new Date(2025, 0, 14) },
            },
          ],
        },
      ],
    } as any);

    const result = await getForecastPlan();

    expect(result.success).toBe(true);
    expect(result.status).toBe("Draft");
    expect(result.entries?.length).toBe(1);
    const entry = result.entries ? result.entries[0] : undefined;
    expect(entry).toBeDefined();
    if (!entry) return;
    expect(entry.category_name).toBe("Cat");
    expect(entry.assignment_type).toBe("Productive");
    expect(entry.project_name).toBe("Project X");
    expect(entry.weekly_hours).toEqual({ 101: 5, 102: 7 });
  });

  it("sets status to Submitted when submitted_at exists", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "7" } } as any);

    mockPrisma.forecastPlan.findFirst.mockResolvedValue({
      id: 1,
      user_id: 7,
      created_at: new Date(),
      submitted_at: new Date(),
      forecast_entries: [],
    } as any);

    const result = await getForecastPlan();

    expect(result).toEqual({ success: true, entries: [], status: "Submitted" });
  });

  it("handles errors gracefully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "7" } } as any);
    mockPrisma.forecastPlan.findFirst.mockRejectedValue(new Error("DB error"));

    const result = await getForecastPlan();

    expect(result).toEqual({
      success: false,
      error: "Failed to fetch forecast plan",
    });
  });
});
