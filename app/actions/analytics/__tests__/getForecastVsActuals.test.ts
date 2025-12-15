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
import type { ForecastVsActualsData } from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";
import { getForecastVsActuals } from "../getForecastVsActuals";

const mockGetSession = getSession as unknown as jest.Mock;
const mockFindManyManagers = prisma.userResourceManagers
  .findMany as unknown as jest.Mock;
const mockFindManyWeeks = prisma.timesheetWeekEnding
  .findMany as unknown as jest.Mock;
const mockFindManyPlans = prisma.forecastPlan.findMany as unknown as jest.Mock;
const mockFindManyTimesheets = prisma.timesheet
  .findMany as unknown as jest.Mock;

describe("getForecastVsActuals", () => {
  const emptyData: ForecastVsActualsData = {
    weekEndings: [],
    forecastHours: [],
    actualHours: [],
    variance: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns empty data when no session", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getForecastVsActuals();

      expect(result).toEqual(emptyData);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty data when no user in session", async () => {
      mockGetSession.mockResolvedValue({ user: null });

      const result = await getForecastVsActuals();

      expect(result).toEqual(emptyData);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty data when no user id in session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: undefined } });

      const result = await getForecastVsActuals();

      expect(result).toEqual(emptyData);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });
  });

  describe("managed users", () => {
    it("returns empty data when no managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([]);

      const result = await getForecastVsActuals();

      expect(result).toEqual(emptyData);
      expect(mockFindManyWeeks).not.toHaveBeenCalled();
    });

    it("queries correct user id for managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "42" } });
      mockFindManyManagers.mockResolvedValue([]);

      await getForecastVsActuals();

      expect(mockFindManyManagers).toHaveBeenCalledWith({
        where: { rm_user_id: 42 },
        select: { user_id: true },
      });
    });
  });

  describe("data retrieval", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([
        { user_id: 10 },
        { user_id: 20 },
      ]);
    });

    it("queries historical week endings with default weeks", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getForecastVsActuals();

      expect(mockFindManyWeeks).toHaveBeenCalledWith({
        where: { week_ending: { lte: expect.any(Date) } },
        orderBy: { week_ending: "desc" },
        take: 4,
      });
    });

    it("queries historical week endings with custom weeks", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getForecastVsActuals(8);

      expect(mockFindManyWeeks).toHaveBeenCalledWith({
        where: { week_ending: { lte: expect.any(Date) } },
        orderBy: { week_ending: "desc" },
        take: 8,
      });
    });

    it("reverses week endings to chronological order", async () => {
      const weekEndings = [
        { id: 3, week_ending: new Date("2024-01-21") },
        { id: 2, week_ending: new Date("2024-01-14") },
        { id: 1, week_ending: new Date("2024-01-07") },
      ];
      mockFindManyWeeks.mockResolvedValue(weekEndings);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getForecastVsActuals(3);

      expect(result.weekEndings).toHaveLength(3);
      expect(result.weekEndings[0].id).toBe(1);
      expect(result.weekEndings[1].id).toBe(2);
      expect(result.weekEndings[2].id).toBe(3);
    });

    it("queries forecast plans with correct filters", async () => {
      mockFindManyWeeks.mockResolvedValue([{ id: 1, week_ending: new Date() }]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getForecastVsActuals(1);

      expect(mockFindManyPlans).toHaveBeenCalledWith({
        where: {
          user_id: { in: [10, 20] },
          submitted_at: { not: null },
        },
        include: {
          forecast_entries: {
            include: {
              weekly_breakdowns: {
                where: { forecast_week_ending_id: { in: [1] } },
              },
            },
          },
        },
      });
    });

    it("queries timesheets with correct filters", async () => {
      mockFindManyWeeks.mockResolvedValue([{ id: 1, week_ending: new Date() }]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getForecastVsActuals(1);

      expect(mockFindManyTimesheets).toHaveBeenCalledWith({
        where: {
          user_id: { in: [10, 20] },
          timesheet_week_ending_id: { in: [1] },
        },
        include: { timesheet_entries: true },
      });
    });
  });

  describe("data calculations", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
    });

    it("calculates forecast hours per week", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [
                { forecast_week_ending_id: 1, hours: 35 },
                { forecast_week_ending_id: 2, hours: 40 },
              ],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getForecastVsActuals(2);

      expect(result.forecastHours).toEqual([35, 40]);
    });

    it("calculates actual hours per week", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());

      mockFindManyPlans.mockResolvedValue([]);

      const timesheets = [
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [{ hours: 30 }, { hours: 5 }],
        },
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 38 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getForecastVsActuals(2);

      expect(result.actualHours).toEqual([35, 38]);
    });

    it("calculates variance correctly", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [
                { forecast_week_ending_id: 1, hours: 40 },
                { forecast_week_ending_id: 2, hours: 35 },
              ],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);

      const timesheets = [
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [{ hours: 38 }],
        },
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [{ hours: 42 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getForecastVsActuals(2);

      expect(result.variance).toEqual([-2, 7]);
    });

    it("aggregates hours from multiple users", async () => {
      const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks.mockResolvedValue(weekEndings);

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 35 }],
            },
          ],
        },
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);

      const timesheets = [
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [{ hours: 30 }],
        },
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [{ hours: 38 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getForecastVsActuals(1);

      expect(result.forecastHours).toEqual([75]);
      expect(result.actualHours).toEqual([68]);
      expect(result.variance).toEqual([-7]);
    });

    it("aggregates hours from multiple forecast entries", async () => {
      const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks.mockResolvedValue(weekEndings);

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 15 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getForecastVsActuals(1);

      expect(result.forecastHours).toEqual([35]);
    });

    it("handles weeks with no forecast data", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());

      mockFindManyPlans.mockResolvedValue([]);

      const timesheets = [
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [{ hours: 35 }],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getForecastVsActuals(2);

      expect(result.forecastHours).toEqual([0, 0]);
      expect(result.actualHours).toEqual([35, 0]);
      expect(result.variance).toEqual([35, 0]);
    });

    it("handles weeks with no actual data", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());

      const forecastPlans = [
        {
          forecast_entries: [
            {
              weekly_breakdowns: [{ forecast_week_ending_id: 2, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getForecastVsActuals(2);

      expect(result.forecastHours).toEqual([0, 40]);
      expect(result.actualHours).toEqual([0, 0]);
      expect(result.variance).toEqual([0, -40]);
    });

    it("creates week labels correctly", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
        { id: 3, week_ending: new Date("2024-01-21") },
      ];
      mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getForecastVsActuals(3);

      expect(result.weekEndings).toHaveLength(3);
      expect(result.weekEndings[0].label).toBe("W1");
      expect(result.weekEndings[1].label).toBe("W2");
      expect(result.weekEndings[2].label).toBe("W3");
    });

    it("includes week ending dates in results", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07T00:00:00Z") },
      ];
      mockFindManyWeeks.mockResolvedValue(weekEndings);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getForecastVsActuals(1);

      expect(result.weekEndings[0].week_ending).toEqual(
        new Date("2024-01-07T00:00:00Z"),
      );
    });
  });

  describe("error handling", () => {
    it("returns empty data on database error", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getForecastVsActuals();

      expect(result).toEqual(emptyData);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching forecast vs actuals:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("handles error during forecast query", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
      mockFindManyWeeks.mockResolvedValue([{ id: 1, week_ending: new Date() }]);
      mockFindManyPlans.mockRejectedValue(new Error("Query error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getForecastVsActuals();

      expect(result).toEqual(emptyData);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
