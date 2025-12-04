/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { submitForecastPlan } from "../submitForecastPlan";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    forecastPlan: { findFirst: jest.fn(), update: jest.fn() },
  },
}));

jest.mock("@/utils/auth/getSession");

describe("submitForecastPlan", () => {
  const mockPrisma = prisma as unknown as {
    forecastPlan: { findFirst: jest.Mock; update: jest.Mock };
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

  it("submits forecast plan and returns status", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "11" } } as any);
    mockPrisma.forecastPlan.findFirst.mockResolvedValue({ id: 4 } as any);
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
