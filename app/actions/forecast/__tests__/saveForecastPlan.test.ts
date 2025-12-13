/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { saveForecastPlan } from "../saveForecastPlan";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    forecastPlan: { findFirst: jest.fn(), update: jest.fn() },
  },
}));

jest.mock("@/utils/auth/getSession");

describe("saveForecastPlan", () => {
  const mockPrisma = prisma as unknown as {
    forecastPlan: { findFirst: jest.Mock; update: jest.Mock };
  };
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unauthorized when session missing", async () => {
    mockGetSession.mockResolvedValue(null as any);

    const result = await saveForecastPlan();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockPrisma.forecastPlan.findFirst).not.toHaveBeenCalled();
  });

  it("returns unauthorized when user id missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: null } } as any);

    const result = await saveForecastPlan();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when no forecast plan found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "9" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue(null);

    const result = await saveForecastPlan();

    expect(result).toEqual({
      success: false,
      error: "No forecast plan found",
    });
    expect(mockPrisma.forecastPlan.update).not.toHaveBeenCalled();
  });

  it("updates plan and returns success", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "9" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({ id: 3 } as any);
    mockPrisma.forecastPlan.update.mockResolvedValue({ id: 3 } as any);

    const result = await saveForecastPlan();

    expect(result).toEqual({ success: true });
    expect(mockPrisma.forecastPlan.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: expect.objectContaining({ updated_at: expect.any(Date) }),
    });
  });

  it("handles errors and returns failure", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "9" } } as any);
    mockPrisma.forecastPlan.findFirst.mockRejectedValue(new Error("DB error"));

    const result = await saveForecastPlan();

    expect(result).toEqual({
      success: false,
      error: "Failed to save forecast plan",
    });
  });
});
