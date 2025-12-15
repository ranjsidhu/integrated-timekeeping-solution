/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
jest.mock("@/utils/auth/getSession");
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    userResourceManagers: { findMany: jest.fn() },
    timesheetWeekEnding: { findMany: jest.fn() },
    forecastPlan: { findMany: jest.fn() },
    timesheet: { findMany: jest.fn() },
  },
}));

import { prisma } from "@/prisma/prisma";
import type { AnalyticsMetrics } from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";
import { getAnalyticsMetrics } from "../getAnalyticsMetrics";

const mockGetSession = getSession as unknown as jest.Mock;
const mockFindManyManagers = prisma.userResourceManagers
  .findMany as unknown as jest.Mock;
const mockFindManyWeeks = prisma.timesheetWeekEnding
  .findMany as unknown as jest.Mock;
const mockFindManyPlans = prisma.forecastPlan.findMany as unknown as jest.Mock;
const mockFindManyTimesheets = prisma.timesheet
  .findMany as unknown as jest.Mock;

describe("getAnalyticsMetrics", () => {
  const emptyMetrics: AnalyticsMetrics = {
    teamUtilization: 0,
    totalBillableHours: 0,
    activeAssignments: 0,
    forecastCompliance: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns empty metrics when no session", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getAnalyticsMetrics();

      expect(result).toEqual(emptyMetrics);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty metrics when no user in session", async () => {
      mockGetSession.mockResolvedValue({ user: null });

      const result = await getAnalyticsMetrics();

      expect(result).toEqual(emptyMetrics);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty metrics when no user id in session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: undefined } });

      const result = await getAnalyticsMetrics();

      expect(result).toEqual(emptyMetrics);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });
  });

  describe("managed users", () => {
    it("returns empty metrics when no managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([]);

      const result = await getAnalyticsMetrics();

      expect(result).toEqual(emptyMetrics);
      expect(mockFindManyWeeks).not.toHaveBeenCalled();
    });

    it("queries correct user id for managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "42" } });
      mockFindManyManagers.mockResolvedValue([]);

      await getAnalyticsMetrics();

      expect(mockFindManyManagers).toHaveBeenCalledWith({
        where: { rm_user_id: 42 },
        select: { user_id: true },
      });
    });
  });

  describe("metrics calculation", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([
        { user_id: 10 },
        { user_id: 20 },
      ]);
    });

    it("queries future week endings with default weeks", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getAnalyticsMetrics();

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(1, {
        where: { week_ending: { gte: expect.any(Date) } },
        orderBy: { week_ending: "asc" },
        take: 4,
      });
    });

    it("queries future week endings with custom weeks", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getAnalyticsMetrics(8);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(1, {
        where: { week_ending: { gte: expect.any(Date) } },
        orderBy: { week_ending: "asc" },
        take: 8,
      });
    });

    it("calculates team utilization correctly", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce(weekEndings)
        .mockResolvedValueOnce([]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              id: 100,
              category: { category_name: "Billable" },
              weekly_breakdowns: [
                { forecast_week_ending_id: 1, hours: 40 },
                { forecast_week_ending_id: 2, hours: 40 },
              ],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getAnalyticsMetrics(2);

      expect(result.teamUtilization).toBe(50.0);
    });

    it("calculates total billable hours", async () => {
      const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(weekEndings)
        .mockResolvedValueOnce([]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              id: 100,
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
            },
            {
              id: 101,
              category: { category_name: "Non-Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 10 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getAnalyticsMetrics(1);

      expect(result.totalBillableHours).toBe(30);
    });

    it("counts active assignments uniquely", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce(weekEndings)
        .mockResolvedValueOnce([]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              id: 100,
              category: { category_name: "Billable" },
              weekly_breakdowns: [
                { forecast_week_ending_id: 1, hours: 20 },
                { forecast_week_ending_id: 2, hours: 20 },
              ],
            },
            {
              id: 101,
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
          ],
        },
        {
          user_id: 20,
          forecast_entries: [
            {
              id: 102,
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 15 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getAnalyticsMetrics(2);

      expect(result.activeAssignments).toBe(3);
    });

    it("aggregates hours across multiple users", async () => {
      const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(weekEndings)
        .mockResolvedValueOnce([]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              id: 100,
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 35 }],
            },
          ],
        },
        {
          user_id: 20,
          forecast_entries: [
            {
              id: 101,
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getAnalyticsMetrics(1);

      expect(result.totalBillableHours).toBe(75);
      expect(result.teamUtilization).toBe(93.8);
    });

    it("queries forecast plans with correct filters", async () => {
      const weekEndings = [{ id: 1, week_ending: new Date() }];
      mockFindManyWeeks
        .mockResolvedValueOnce(weekEndings)
        .mockResolvedValueOnce([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getAnalyticsMetrics(1);

      expect(mockFindManyPlans).toHaveBeenNthCalledWith(1, {
        where: {
          user_id: { in: [10, 20] },
          submitted_at: { not: null },
        },
        include: {
          forecast_entries: {
            include: {
              category: true,
              weekly_breakdowns: {
                where: { forecast_week_ending_id: { in: [1] } },
              },
            },
          },
        },
      });
    });
  });

  describe("forecast compliance", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
    });

    it("queries historical weeks for compliance calculation", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getAnalyticsMetrics(6);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(2, {
        where: { week_ending: { lte: expect.any(Date) } },
        orderBy: { week_ending: "desc" },
        take: 4,
      });
    });

    it("limits historical weeks to 4 even with larger weeksToShow", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getAnalyticsMetrics(10);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(2, {
        where: { week_ending: { lte: expect.any(Date) } },
        orderBy: { week_ending: "desc" },
        take: 4,
      });
    });

    it("uses weeksToShow when smaller than 4", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getAnalyticsMetrics(2);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(2, {
        where: { week_ending: { lte: expect.any(Date) } },
        orderBy: { week_ending: "desc" },
        take: 2,
      });
    });

    it("calculates 100% compliance when forecast matches actual", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(forecastPlans);

      const timesheets = [
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 40 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getAnalyticsMetrics(1);

      expect(result.forecastCompliance).toBe(100);
    });

    it("calculates compliance with under-forecast", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(forecastPlans);

      const timesheets = [
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 32 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getAnalyticsMetrics(1);

      expect(result.forecastCompliance).toBe(80.0);
    });

    it("calculates compliance with over-forecast", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(forecastPlans);

      const timesheets = [
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 50 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getAnalyticsMetrics(1);

      expect(result.forecastCompliance).toBe(75.0);
    });

    it("returns 100% compliance when no historical forecast", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getAnalyticsMetrics(1);

      expect(result.forecastCompliance).toBe(100);
    });

    it("aggregates historical data across multiple users", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 40 }],
            },
          ],
        },
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(forecastPlans);

      const timesheets = [
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 35 }],
        },
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 40 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getAnalyticsMetrics(1);

      expect(result.forecastCompliance).toBe(93.8);
    });

    it("ensures compliance never goes below 0", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 10 }],
            },
          ],
        },
      ];
      mockFindManyPlans
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(forecastPlans);

      const timesheets = [
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 50 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getAnalyticsMetrics(1);

      expect(result.forecastCompliance).toBeGreaterThanOrEqual(0);
    });

    it("queries historical forecast plans with correct filters", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getAnalyticsMetrics(1);

      expect(mockFindManyPlans).toHaveBeenNthCalledWith(2, {
        where: {
          user_id: { in: [10] },
          submitted_at: { not: null },
        },
        include: {
          forecast_entries: {
            include: {
              weekly_breakdowns: {
                where: { forecast_week_ending_id: { in: [2] } },
              },
            },
          },
        },
      });
    });
  });

  describe("error handling", () => {
    it("returns empty metrics on database error", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getAnalyticsMetrics();

      expect(result).toEqual(emptyMetrics);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching analytics metrics:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("handles error during forecast calculation", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
      mockFindManyWeeks.mockResolvedValue([{ id: 1, week_ending: new Date() }]);
      mockFindManyPlans.mockRejectedValue(new Error("Query error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getAnalyticsMetrics();

      expect(result).toEqual(emptyMetrics);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
