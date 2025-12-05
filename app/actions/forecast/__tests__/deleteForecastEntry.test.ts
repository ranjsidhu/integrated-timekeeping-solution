/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { deleteForecastEntry } from "../deleteForecastEntry";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    forecastEntry: { findUnique: jest.fn(), delete: jest.fn() },
    forecastWeeklyBreakdown: { deleteMany: jest.fn() },
  },
}));

jest.mock("@/utils/auth/getSession");

describe("deleteForecastEntry", () => {
  const mockPrisma = prisma as unknown as {
    forecastEntry: { findUnique: jest.Mock; delete: jest.Mock };
    forecastWeeklyBreakdown: { deleteMany: jest.Mock };
  };
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockGetSession.mockResolvedValue(null as any);

    const result = await deleteForecastEntry(1);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockPrisma.forecastEntry.findUnique).not.toHaveBeenCalled();
  });

  it("returns unauthorized when user id missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: null } } as any);

    const result = await deleteForecastEntry(1);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns entry not found when lookup fails", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    mockPrisma.forecastEntry.findUnique.mockResolvedValue(null);

    const result = await deleteForecastEntry(1);

    expect(result).toEqual({ success: false, error: "Entry not found" });
    expect(mockPrisma.forecastEntry.delete).not.toHaveBeenCalled();
    expect(
      mockPrisma.forecastWeeklyBreakdown.deleteMany,
    ).not.toHaveBeenCalled();
  });

  it("returns unauthorized when entry belongs to another user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    mockPrisma.forecastEntry.findUnique.mockResolvedValue({
      id: 1,
      forecast_plan: { user_id: 99 },
    } as any);

    const result = await deleteForecastEntry(1);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockPrisma.forecastEntry.delete).not.toHaveBeenCalled();
    expect(
      mockPrisma.forecastWeeklyBreakdown.deleteMany,
    ).not.toHaveBeenCalled();
  });

  it("deletes weekly breakdowns and entry when authorized", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    mockPrisma.forecastEntry.findUnique.mockResolvedValue({
      id: 1,
      forecast_plan: { user_id: 5 },
    } as any);

    mockPrisma.forecastWeeklyBreakdown.deleteMany.mockResolvedValue({
      count: 1,
    } as any);
    mockPrisma.forecastEntry.delete.mockResolvedValue({ id: 1 } as any);

    const result = await deleteForecastEntry(1);

    expect(result).toEqual({ success: true });
    expect(mockPrisma.forecastWeeklyBreakdown.deleteMany).toHaveBeenCalledWith({
      where: { forecast_entry_id: 1 },
    });
    expect(mockPrisma.forecastEntry.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it("handles errors and returns failure", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "5" } } as any);
    mockPrisma.forecastEntry.findUnique.mockRejectedValue(
      new Error("DB error"),
    );

    const result = await deleteForecastEntry(1);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete forecast entry",
    });
  });
});
