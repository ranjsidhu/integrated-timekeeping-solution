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
import { getSession } from "@/utils/auth/getSession";
import { getProjectAnalytics } from "../getProjectAnalytics";

const mockGetSession = getSession as unknown as jest.Mock;
const mockFindManyManagers = prisma.userResourceManagers
  .findMany as unknown as jest.Mock;
const mockFindManyWeeks = prisma.timesheetWeekEnding
  .findMany as unknown as jest.Mock;
const mockFindManyPlans = prisma.forecastPlan.findMany as unknown as jest.Mock;
const mockFindManyTimesheets = prisma.timesheet
  .findMany as unknown as jest.Mock;

describe("getProjectAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns empty array when no session", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getProjectAnalytics();

      expect(result).toEqual([]);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty array when no user in session", async () => {
      mockGetSession.mockResolvedValue({ user: null });

      const result = await getProjectAnalytics();

      expect(result).toEqual([]);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty array when no user id in session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: undefined } });

      const result = await getProjectAnalytics();

      expect(result).toEqual([]);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });
  });

  describe("managed users", () => {
    it("returns empty array when no managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([]);

      const result = await getProjectAnalytics();

      expect(result).toEqual([]);
      expect(mockFindManyWeeks).not.toHaveBeenCalled();
    });

    it("queries correct user id for managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "42" } });
      mockFindManyManagers.mockResolvedValue([]);

      await getProjectAnalytics();

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

    it("queries future week endings with default weeks", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getProjectAnalytics();

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

      await getProjectAnalytics(6);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(1, {
        where: { week_ending: { gte: expect.any(Date) } },
        orderBy: { week_ending: "asc" },
        take: 6,
      });
    });

    it("queries historical week endings", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getProjectAnalytics(3);

      expect(mockFindManyWeeks).toHaveBeenNthCalledWith(2, {
        where: { week_ending: { lte: expect.any(Date) } },
        orderBy: { week_ending: "desc" },
        take: 3,
      });
    });

    it("queries forecast plans with correct filters", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getProjectAnalytics(1);

      expect(mockFindManyPlans).toHaveBeenCalledWith({
        where: {
          user_id: { in: [10, 20] },
          submitted_at: { not: null },
        },
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
      mockFindManyPlans.mockResolvedValue([]);
      mockFindManyTimesheets.mockResolvedValue([]);

      await getProjectAnalytics(1);

      expect(mockFindManyTimesheets).toHaveBeenCalledWith({
        where: {
          user_id: { in: [10, 20] },
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

  describe("project analytics calculations", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
    });

    it("aggregates forecast hours by project", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        projectId: 100,
        projectName: "Project A",
        forecastHours: 40,
      });
    });

    it("aggregates actual hours by project", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      mockFindManyPlans.mockResolvedValue([]);

      const timesheets = [
        {
          user_id: 10,
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 35,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getProjectAnalytics(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        projectId: 100,
        projectName: "Project A",
        actualHours: 35,
      });
    });

    it("separates billable and non-billable hours", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
            },
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Non-Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 10 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(1);

      expect(result[0]).toMatchObject({
        forecastHours: 40,
        billableHours: 30,
        nonBillableHours: 10,
      });
    });

    it("calculates variance correctly", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 40 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);

      const timesheets = [
        {
          user_id: 10,
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 35,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getProjectAnalytics(1);

      expect(result[0].variance).toBe(-5);
    });

    it("calculates utilization rate correctly", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
            },
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Non-Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 10 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(1);

      expect(result[0].utilizationRate).toBe(75.0);
    });

    it("returns 0 utilization rate when no forecast hours", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      mockFindManyPlans.mockResolvedValue([]);

      const timesheets = [
        {
          user_id: 10,
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 35,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getProjectAnalytics(1);

      expect(result[0].utilizationRate).toBe(0);
    });

    it("counts unique team members per project", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
          ],
        },
        {
          user_id: 20,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(1);

      expect(result[0].teamMemberCount).toBe(2);
    });

    it("includes team members from both forecast and actual data", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);

      const timesheets = [
        {
          user_id: 20,
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 15,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
          ],
        },
        {
          user_id: 30,
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 10,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getProjectAnalytics(1);

      expect(result[0].teamMemberCount).toBe(3);
    });

    it("aggregates hours across multiple weeks", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([
          { id: 1, week_ending: new Date() },
          { id: 2, week_ending: new Date() },
        ])
        .mockResolvedValueOnce([{ id: 3, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [
                { forecast_week_ending_id: 1, hours: 20 },
                { forecast_week_ending_id: 2, hours: 15 },
              ],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(2);

      expect(result[0].forecastHours).toBe(35);
    });

    it("handles multiple projects", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 40 }],
            },
            {
              project: { id: 101, project_name: "Project B" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(1);

      expect(result).toHaveLength(2);
      expect(result[0].projectName).toBe("Project A");
      expect(result[1].projectName).toBe("Project B");
    });

    it("sorts projects by forecast hours descending", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
            {
              project: { id: 101, project_name: "Project B" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 50 }],
            },
            {
              project: { id: 102, project_name: "Project C" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 35 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(1);

      expect(result[0].projectName).toBe("Project B");
      expect(result[0].forecastHours).toBe(50);
      expect(result[1].projectName).toBe("Project C");
      expect(result[1].forecastHours).toBe(35);
      expect(result[2].projectName).toBe("Project A");
      expect(result[2].forecastHours).toBe(20);
    });

    it("handles forecast entries without projects", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      const forecastPlans = [
        {
          user_id: 10,
          forecast_entries: [
            {
              project: null,
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
            },
            {
              project: { id: 100, project_name: "Project A" },
              category: { category_name: "Billable" },
              weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
            },
          ],
        },
      ];
      mockFindManyPlans.mockResolvedValue(forecastPlans);
      mockFindManyTimesheets.mockResolvedValue([]);

      const result = await getProjectAnalytics(1);

      expect(result).toHaveLength(1);
      expect(result[0].projectName).toBe("Project A");
    });

    it("handles timesheet entries without projects", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      mockFindManyPlans.mockResolvedValue([]);

      const timesheets = [
        {
          user_id: 10,
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 20,
              bill_code: {
                work_item: {
                  code: {
                    project: null,
                  },
                },
              },
            },
            {
              hours: 35,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getProjectAnalytics(1);

      expect(result).toHaveLength(1);
      expect(result[0].actualHours).toBe(35);
    });

    it("aggregates hours from multiple timesheet entries", async () => {
      mockFindManyWeeks
        .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
        .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);

      mockFindManyPlans.mockResolvedValue([]);

      const timesheets = [
        {
          user_id: 10,
          timesheet_week_ending_id: 2,
          timesheet_entries: [
            {
              hours: 20,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
            {
              hours: 15,
              bill_code: {
                work_item: {
                  code: {
                    project: { id: 100, project_name: "Project A" },
                  },
                },
              },
            },
          ],
        },
      ];
      mockFindManyTimesheets.mockResolvedValue(timesheets);

      const result = await getProjectAnalytics(1);

      expect(result[0].actualHours).toBe(35);
    });
  });

  describe("error handling", () => {
    it("returns empty array on database error", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getProjectAnalytics();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching project analytics:",
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

      const result = await getProjectAnalytics();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
