/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
jest.mock("@/utils/auth/getSession");
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    userResourceManagers: { findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
    timesheetWeekEnding: { findMany: jest.fn() },
    forecastPlan: { findFirst: jest.fn() },
    timesheet: { findMany: jest.fn() },
  },
}));

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { getIndividualAnalytics } from "../getIndividualAnalytics";

const mockGetSession = getSession as unknown as jest.Mock;
const mockFindFirstManager = prisma.userResourceManagers
  .findFirst as unknown as jest.Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as jest.Mock;
const mockFindManyWeeks = prisma.timesheetWeekEnding
  .findMany as unknown as jest.Mock;
const mockFindFirstPlan = prisma.forecastPlan.findFirst as unknown as jest.Mock;
const mockFindManyTimesheets = prisma.timesheet
  .findMany as unknown as jest.Mock;

describe("getIndividualAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns null when no session", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getIndividualAnalytics(10);

      expect(result).toBeNull();
      expect(mockFindFirstManager).not.toHaveBeenCalled();
    });

    it("returns null when no user in session", async () => {
      mockGetSession.mockResolvedValue({ user: null });

      const result = await getIndividualAnalytics(10);

      expect(result).toBeNull();
      expect(mockFindFirstManager).not.toHaveBeenCalled();
    });

    it("returns null when no user id in session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: undefined } });

      const result = await getIndividualAnalytics(10);

      expect(result).toBeNull();
      expect(mockFindFirstManager).not.toHaveBeenCalled();
    });
  });

  describe("authorization", () => {
    it("returns null when user is not managed by current user", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindFirstManager.mockResolvedValue(null);

      const result = await getIndividualAnalytics(10);

      expect(result).toBeNull();
      expect(mockFindUniqueUser).not.toHaveBeenCalled();
    });

    it("verifies management relationship with correct user ids", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "42" } });
      mockFindFirstManager.mockResolvedValue(null);

      await getIndividualAnalytics(10);

      expect(mockFindFirstManager).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          rm_user_id: 42,
        },
      });
    });

    it("returns null when user not found", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindFirstManager.mockResolvedValue({ user_id: 10, rm_user_id: 1 });
      mockFindUniqueUser.mockResolvedValue(null);

      const result = await getIndividualAnalytics(10);

      expect(result).toBeNull();
      expect(mockFindManyWeeks).not.toHaveBeenCalled();
    });

    it("queries user with correct id", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindFirstManager.mockResolvedValue({ user_id: 10, rm_user_id: 1 });
      mockFindUniqueUser.mockResolvedValue(null);

      await getIndividualAnalytics(10);

      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: { id: 10 },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });
  });

  describe("data retrieval", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindFirstManager.mockResolvedValue({ user_id: 10, rm_user_id: 1 });
      mockFindUniqueUser.mockResolvedValue({
        id: 10,
        name: "John Doe",
        email: "john@test.com",
      });
    });

    it("queries future weeks with default value", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getIndividualAnalytics(10);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(1, {
        where: { week_ending: { gte: expect.any(Date) } },
        orderBy: { week_ending: "asc" },
        take: 4,
      });
    });

    it("queries future weeks with custom value", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getIndividualAnalytics(10, 8);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(1, {
        where: { week_ending: { gte: expect.any(Date) } },
        orderBy: { week_ending: "asc" },
        take: 8,
      });
    });

    it("queries historical weeks and reverses order", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getIndividualAnalytics(10, 3);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(2, {
        where: { week_ending: { lte: expect.any(Date) } },
        orderBy: { week_ending: "desc" },
        take: 3,
      });
    });

    it("queries latest submitted forecast plan", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);
      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getIndividualAnalytics(10);

      expect(mockFindFirstPlan).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          submitted_at: { not: null },
        },
        orderBy: { submitted_at: "desc" },
        include: {
          forecast_entries: {
            include: {
              project: true,
              category: true,
              weekly_breakdowns: {
                where: { forecast_week_ending_id: { in: [1] } },
              },
            },
          },
        },
      });
    });

    it("queries timesheets with correct filters", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);
      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getIndividualAnalytics(10);

      expect(mockFindManyTimesheets).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          timesheet_week_ending_id: { in: [2] },
        },
        include: {
          timesheet_entries: {
            include: {
              bill_code: {
                include: {
                  work_item: {
                    include: {
                      code: {
                        include: {
                          project: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  });

  describe("analytics calculations", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindFirstManager.mockResolvedValue({ user_id: 10, rm_user_id: 1 });
      mockFindUniqueUser.mockResolvedValue({
        id: 10,
        name: "John Doe",
        email: "john@test.com",
      });
    });

    it("returns user information in result", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10);

      expect(result?.user).toEqual({
        id: 10,
        name: "John Doe",
        email: "john@test.com",
      });
    });

    it("calculates forecast hours by week", async () => {
      const futureWeeks = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [
              { forecast_week_ending_id: 1, hours: 30 },
              { forecast_week_ending_id: 2, hours: 35 },
            ],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 2);

      expect(result?.weeklyData.futureWeeks).toHaveLength(2);
      expect(result?.weeklyData.futureWeeks[0].forecastHours).toBe(30);
      expect(result?.weeklyData.futureWeeks[1].forecastHours).toBe(35);
    });

    it("calculates forecast billable hours separately", async () => {
      const futureWeeks = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
          },
          {
            project: { id: 101, project_name: "Project B" },
            category: { category_name: "Non-Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 10 }],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.weeklyData.futureWeeks[0].forecastHours).toBe(40);
      expect(result?.weeklyData.futureWeeks[0].forecastBillableHours).toBe(30);
      expect(result?.summary.forecastBillableHours).toBe(30);
    });

    it("calculates actual hours by week", async () => {
      const historicalWeeks = [
        { id: 2, week_ending: new Date("2024-01-07") },
        { id: 1, week_ending: new Date("2023-12-31") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(historicalWeeks);

      mockFindFirstPlan.mockResolvedValue(null);

      const timesheets = [
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [
            {
              hours: 20,
              bill_code: { is_billable: true },
            },
            {
              hours: 15,
              bill_code: { is_billable: true },
            },
          ],
        },
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 38,
              bill_code: { is_billable: true },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getIndividualAnalytics(10, 2);

      expect(result?.weeklyData.historicalWeeks).toHaveLength(2);
      expect(result?.weeklyData.historicalWeeks[0].actualHours).toBe(35);
      expect(result?.weeklyData.historicalWeeks[1].actualHours).toBe(38);
    });

    it("calculates actual billable hours separately", async () => {
      const historicalWeeks = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([...historicalWeeks].reverse());

      mockFindFirstPlan.mockResolvedValue(null);

      const timesheets = [
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [
            {
              hours: 30,
              bill_code: { is_billable: true },
            },
            {
              hours: 10,
              bill_code: { is_billable: false },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.weeklyData.historicalWeeks[0].actualHours).toBe(40);
      expect(result?.weeklyData.historicalWeeks[0].actualBillableHours).toBe(
        30,
      );
      expect(result?.summary.actualBillableHours).toBe(30);
    });

    it("tracks project assignments with total hours", async () => {
      const futureWeeks = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [
              { forecast_week_ending_id: 1, hours: 20 },
              { forecast_week_ending_id: 2, hours: 15 },
            ],
          },
          {
            project: { id: 101, project_name: "Project B" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 2);

      expect(result?.projectAssignments).toHaveLength(2);
      expect(result?.projectAssignments[0]).toMatchObject({
        projectId: 100,
        projectName: "Project A",
        totalHours: 35,
      });
      expect(result?.projectAssignments[1]).toMatchObject({
        projectId: 101,
        projectName: "Project B",
        totalHours: 30,
      });
    });

    it("sorts project assignments by hours descending", async () => {
      const futureWeeks = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
          },
          {
            project: { id: 101, project_name: "Project B" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 40 }],
          },
          {
            project: { id: 102, project_name: "Project C" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.projectAssignments[0].projectName).toBe("Project B");
      expect(result?.projectAssignments[1].projectName).toBe("Project C");
      expect(result?.projectAssignments[2].projectName).toBe("Project A");
    });

    it("aggregates hours for same project", async () => {
      const futureWeeks = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
          },
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Non-Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 10 }],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.projectAssignments).toHaveLength(1);
      expect(result?.projectAssignments[0].totalHours).toBe(30);
    });

    it("calculates forecast utilization", async () => {
      const futureWeeks = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [
              { forecast_week_ending_id: 1, hours: 40 },
              { forecast_week_ending_id: 2, hours: 32 },
            ],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 2);

      expect(result?.summary.forecastUtilization).toBe(90.0);
    });

    it("calculates actual utilization", async () => {
      const historicalWeeks = [
        { id: 2, week_ending: new Date("2024-01-07") },
        { id: 1, week_ending: new Date("2023-12-31") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(historicalWeeks);

      mockFindFirstPlan.mockResolvedValue(null);

      const timesheets = [
        {
          timesheet_week_ending_id: 1,
          timesheet_entries: [
            {
              hours: 35,
              bill_code: { is_billable: true },
            },
          ],
        },
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 40,
              bill_code: { is_billable: true },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getIndividualAnalytics(10, 2);

      expect(result?.summary.actualUtilization).toBe(93.8);
    });

    it("calculates forecast compliance", async () => {
      const futureWeeks = [{ id: 1, week_ending: new Date("2024-01-07") }];
      const historicalWeeks = [{ id: 2, week_ending: new Date("2023-12-31") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([...historicalWeeks].reverse());

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 40 }],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);

      const timesheets = [
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 38,
              bill_code: { is_billable: true },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.summary.forecastCompliance).toBe(95.0);
    });

    it("ensures forecast compliance never goes below 0", async () => {
      const futureWeeks = [{ id: 1, week_ending: new Date("2024-01-07") }];
      const historicalWeeks = [{ id: 2, week_ending: new Date("2023-12-31") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([...historicalWeeks].reverse());

      const forecastPlan = {
        forecast_entries: [
          {
            project: { id: 100, project_name: "Project A" },
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 10 }],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);

      const timesheets = [
        {
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 50,
              bill_code: { is_billable: true },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.summary.forecastCompliance).toBeGreaterThanOrEqual(0);
    });

    it("returns 100% compliance when no forecast hours", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }]);

      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.summary.forecastCompliance).toBe(100);
    });

    it("creates week labels for future weeks", async () => {
      const futureWeeks = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
        { id: 3, week_ending: new Date("2024-01-21") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 3);

      expect(result?.weeklyData.futureWeeks[0].label).toBe("W1");
      expect(result?.weeklyData.futureWeeks[1].label).toBe("W2");
      expect(result?.weeklyData.futureWeeks[2].label).toBe("W3");
    });

    it("creates week labels for historical weeks", async () => {
      const historicalWeeks = [
        { id: 3, week_ending: new Date("2024-01-21") },
        { id: 2, week_ending: new Date("2024-01-14") },
        { id: 1, week_ending: new Date("2024-01-07") },
      ];
      mockFindManyWeeks
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(historicalWeeks);

      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 3);

      expect(result?.weeklyData.historicalWeeks[0].label).toBe("W1");
      expect(result?.weeklyData.historicalWeeks[1].label).toBe("W2");
      expect(result?.weeklyData.historicalWeeks[2].label).toBe("W3");
    });

    it("handles no forecast plan", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      mockFindFirstPlan.mockResolvedValue(null);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.summary.forecastHours).toBe(0);
      expect(result?.summary.forecastBillableHours).toBe(0);
      expect(result?.projectAssignments).toHaveLength(0);
    });

    it("handles forecast entries without projects", async () => {
      const futureWeeks = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks
        .mockResolvedValueOnce(futureWeeks)
        .mockResolvedValueOnce([]);

      const forecastPlan = {
        forecast_entries: [
          {
            project: null,
            category: { category_name: "Billable" },
            weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
          },
        ],
      };
      mockFindFirstPlan.mockResolvedValue(forecastPlan);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getIndividualAnalytics(10, 1);

      expect(result?.summary.forecastHours).toBe(20);
      expect(result?.projectAssignments).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    it("returns null on database error", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindFirstManager.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getIndividualAnalytics(10);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching individual analytics:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("handles error during forecast query", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindFirstManager.mockResolvedValue({ user_id: 10, rm_user_id: 1 });
      mockFindUniqueUser.mockResolvedValue({
        id: 10,
        name: "John Doe",
        email: "john@test.com",
      });
      mockFindManyWeeks.mockResolvedValue([{ id: 1, week_ending: new Date() }]);
      mockFindFirstPlan.mockRejectedValue(new Error("Query error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getIndividualAnalytics(10);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
