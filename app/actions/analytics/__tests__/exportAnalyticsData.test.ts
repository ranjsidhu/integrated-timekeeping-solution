/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
jest.mock("@/utils/auth/getSession");
jest.mock("@/utils/auth/routeProtection", () => ({
  withRoleProtection: jest.fn(),
}));
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    userResourceManagers: { findMany: jest.fn() },
    timesheetWeekEnding: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
    forecastPlan: { findMany: jest.fn() },
    timesheet: { findMany: jest.fn() },
  },
}));
jest.mock("@/utils/analytics/analyticsRoles", () => ({
  analyticsRoles: ["Manager", "Admin"],
}));

import { prisma } from "@/prisma/prisma";
import type {
  ForecastActualsExportRow,
  ProjectExportRow,
  TeamExportRow,
} from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";
import { withRoleProtection } from "@/utils/auth/routeProtection";
import { getExportData, getProtectedExportData } from "../exportAnalyticsData";

const mockGetSession = getSession as unknown as jest.Mock;
const mockWithRoleProtection = withRoleProtection as unknown as jest.Mock;
const mockFindManyManagers = prisma.userResourceManagers
  .findMany as unknown as jest.Mock;
const mockFindManyWeeks = prisma.timesheetWeekEnding
  .findMany as unknown as jest.Mock;
const mockFindManyUsers = prisma.user.findMany as unknown as jest.Mock;
const mockFindManyPlans = prisma.forecastPlan.findMany as unknown as jest.Mock;
const mockFindManyTimesheets = prisma.timesheet
  .findMany as unknown as jest.Mock;

describe("exportAnalyticsData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProtectedExportData", () => {
    it("calls withRoleProtection with correct parameters", async () => {
      mockWithRoleProtection.mockResolvedValue([]);

      await getProtectedExportData("team", 4);

      expect(mockWithRoleProtection).toHaveBeenCalledWith(
        getExportData,
        ["Manager", "Admin"],
        "team",
        4,
      );
    });

    it("uses default weeksToShow value", async () => {
      mockWithRoleProtection.mockResolvedValue([]);

      await getProtectedExportData("projects");

      expect(mockWithRoleProtection).toHaveBeenCalledWith(
        getExportData,
        ["Manager", "Admin"],
        "projects",
        4,
      );
    });

    it("returns result from withRoleProtection", async () => {
      const expectedData: TeamExportRow[] = [
        { name: "User 1", email: "user1@test.com" },
      ];
      mockWithRoleProtection.mockResolvedValue(expectedData);

      const result = await getProtectedExportData("team");

      expect(result).toEqual(expectedData);
    });
  });

  describe("getExportData", () => {
    describe("authentication", () => {
      it("returns empty array when no session", async () => {
        mockGetSession.mockResolvedValue(null);

        const result = await getExportData("team");

        expect(result).toEqual([]);
        expect(mockFindManyManagers).not.toHaveBeenCalled();
      });

      it("returns empty array when no user in session", async () => {
        mockGetSession.mockResolvedValue({ user: null });

        const result = await getExportData("team");

        expect(result).toEqual([]);
        expect(mockFindManyManagers).not.toHaveBeenCalled();
      });

      it("returns empty array when no user id in session", async () => {
        mockGetSession.mockResolvedValue({ user: { id: undefined } });

        const result = await getExportData("team");

        expect(result).toEqual([]);
        expect(mockFindManyManagers).not.toHaveBeenCalled();
      });
    });

    describe("managed users", () => {
      it("returns empty array when no managed users", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "1" } });
        mockFindManyManagers.mockResolvedValue([]);

        const result = await getExportData("team");

        expect(result).toEqual([]);
        expect(mockFindManyWeeks).not.toHaveBeenCalled();
      });

      it("queries correct user id for managed users", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "42" } });
        mockFindManyManagers.mockResolvedValue([]);

        await getExportData("team");

        expect(mockFindManyManagers).toHaveBeenCalledWith({
          where: { rm_user_id: 42 },
          select: { user_id: true },
        });
      });
    });

    describe("team export", () => {
      beforeEach(() => {
        mockGetSession.mockResolvedValue({ user: { id: "1" } });
        mockFindManyManagers.mockResolvedValue([
          { user_id: 10 },
          { user_id: 20 },
        ]);
      });

      it("queries future week endings", async () => {
        mockFindManyWeeks.mockResolvedValue([]);
        mockFindManyUsers.mockResolvedValue([]);

        await getExportData("team", 5);

        expect(mockFindManyWeeks).toHaveBeenCalledWith({
          where: { week_ending: { gte: expect.any(Date) } },
          orderBy: { week_ending: "asc" },
          take: 5,
        });
      });

      it("exports team capacity data with weekly hours", async () => {
        const weekEndings = [
          { id: 1, week_ending: new Date("2024-01-07") },
          { id: 2, week_ending: new Date("2024-01-14") },
        ];
        mockFindManyWeeks.mockResolvedValue(weekEndings);

        const users = [
          {
            id: 10,
            name: "Alice",
            email: "alice@test.com",
            forecast_plans: [
              {
                submitted_at: new Date(),
                forecast_entries: [
                  {
                    weekly_breakdowns: [
                      { forecast_week_ending_id: 1, hours: 30 },
                      { forecast_week_ending_id: 2, hours: 35 },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 20,
            name: "Bob",
            email: "bob@test.com",
            forecast_plans: [],
          },
        ];
        mockFindManyUsers.mockResolvedValue(users);

        const result = (await getExportData("team", 2)) as TeamExportRow[];

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          name: "Alice",
          email: "alice@test.com",
          "Week 1 (Jan 7)": 30,
          "Week 2 (Jan 14)": 35,
          "Average Utilization %": "81.3",
        });
        expect(result[1]).toMatchObject({
          name: "Bob",
          email: "bob@test.com",
          "Week 1 (Jan 7)": 0,
          "Week 2 (Jan 14)": 0,
          "Average Utilization %": "0.0",
        });
      });

      it("aggregates hours across multiple forecast entries", async () => {
        const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
        mockFindManyWeeks.mockResolvedValue(weekEndings);

        const users = [
          {
            id: 10,
            name: "Alice",
            email: "alice@test.com",
            forecast_plans: [
              {
                submitted_at: new Date(),
                forecast_entries: [
                  {
                    weekly_breakdowns: [
                      { forecast_week_ending_id: 1, hours: 20 },
                    ],
                  },
                  {
                    weekly_breakdowns: [
                      { forecast_week_ending_id: 1, hours: 15 },
                    ],
                  },
                ],
              },
            ],
          },
        ];
        mockFindManyUsers.mockResolvedValue(users);

        const result = (await getExportData("team", 1)) as TeamExportRow[];

        expect(result[0]["Week 1 (Jan 7)"]).toBe(35);
        expect(result[0]["Average Utilization %"]).toBe("87.5");
      });

      it("uses only latest submitted forecast plan", async () => {
        const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
        mockFindManyWeeks.mockResolvedValue(weekEndings);

        mockFindManyUsers.mockResolvedValue([
          {
            id: 10,
            name: "Alice",
            email: "alice@test.com",
            forecast_plans: [
              {
                submitted_at: new Date("2024-01-02"),
                forecast_entries: [
                  {
                    weekly_breakdowns: [
                      { forecast_week_ending_id: 1, hours: 40 },
                    ],
                  },
                ],
              },
            ],
          },
        ]);

        const result = (await getExportData("team", 1)) as TeamExportRow[];

        expect(result[0]["Week 1 (Jan 7)"]).toBe(40);
      });

      it("queries users with correct filters", async () => {
        mockFindManyWeeks.mockResolvedValue([
          { id: 1, week_ending: new Date() },
        ]);
        mockFindManyUsers.mockResolvedValue([]);

        await getExportData("team", 1);

        expect(mockFindManyUsers).toHaveBeenCalledWith({
          where: { id: { in: [10, 20] } },
          include: {
            forecast_plans: {
              where: { submitted_at: { not: null } },
              orderBy: { submitted_at: "desc" },
              take: 1,
              include: {
                forecast_entries: {
                  include: {
                    weekly_breakdowns: {
                      where: { forecast_week_ending_id: { in: [1] } },
                    },
                  },
                },
              },
            },
          },
        });
      });
    });

    describe("projects export", () => {
      beforeEach(() => {
        mockGetSession.mockResolvedValue({ user: { id: "1" } });
        mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
      });

      it("queries both future and historical weeks", async () => {
        mockFindManyWeeks.mockResolvedValue([]);
        mockFindManyPlans.mockResolvedValue([]);
        mockFindManyTimesheets.mockResolvedValue([]);

        await getExportData("projects", 3);

        expect(mockFindManyWeeks).toHaveBeenCalledTimes(2);
        expect(mockFindManyWeeks).toHaveBeenNthCalledWith(1, {
          where: { week_ending: { gte: expect.any(Date) } },
          orderBy: { week_ending: "asc" },
          take: 3,
        });
        expect(mockFindManyWeeks).toHaveBeenNthCalledWith(2, {
          where: { week_ending: { lte: expect.any(Date) } },
          orderBy: { week_ending: "desc" },
          take: 3,
        });
      });

      it("exports project analytics with forecast and actuals", async () => {
        mockFindManyWeeks
          .mockResolvedValueOnce([
            { id: 1, week_ending: new Date("2024-01-07") },
          ])
          .mockResolvedValueOnce([
            { id: 2, week_ending: new Date("2023-12-31") },
          ]);

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

        const result = (await getExportData(
          "projects",
          1,
        )) as ProjectExportRow[];

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          projectName: "Project A",
          teamSize: 1,
          forecastHours: 40,
          actualHours: 35,
          variance: -5,
          billableHours: 40,
          nonBillableHours: 0,
          utilizationRate: 100,
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

        const result = (await getExportData(
          "projects",
          1,
        )) as ProjectExportRow[];

        expect(result[0]).toMatchObject({
          forecastHours: 40,
          billableHours: 30,
          nonBillableHours: 10,
          utilizationRate: 75,
        });
      });

      it("calculates team size from unique users", async () => {
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

        const timesheets = [
          {
            user_id: 30,
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
        ];
        mockFindManyTimesheets.mockResolvedValue(timesheets);

        const result = (await getExportData(
          "projects",
          1,
        )) as ProjectExportRow[];

        expect(result[0].teamSize).toBe(3);
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
            ],
          },
        ];
        mockFindManyPlans.mockResolvedValue(forecastPlans);
        mockFindManyTimesheets.mockResolvedValue([]);

        const result = (await getExportData(
          "projects",
          1,
        )) as ProjectExportRow[];

        expect(result[0].projectName).toBe("Project B");
        expect(result[1].projectName).toBe("Project A");
      });

      it("handles projects with zero forecast hours", async () => {
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
            ],
          },
        ];
        mockFindManyTimesheets.mockResolvedValue(timesheets);

        const result = (await getExportData(
          "projects",
          1,
        )) as ProjectExportRow[];

        expect(result[0]).toMatchObject({
          projectName: "Project A",
          forecastHours: 0,
          actualHours: 20,
          variance: 20,
          utilizationRate: 0,
        });
      });

      it("queries forecast plans with correct filters", async () => {
        mockFindManyWeeks
          .mockResolvedValueOnce([{ id: 1, week_ending: new Date() }])
          .mockResolvedValueOnce([{ id: 2, week_ending: new Date() }]);
        mockFindManyPlans.mockResolvedValue([]);
        mockFindManyTimesheets.mockResolvedValue([]);

        await getExportData("projects", 1);

        expect(mockFindManyPlans).toHaveBeenCalledWith({
          where: {
            user_id: { in: [10] },
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
    });

    describe("forecast-actuals export", () => {
      beforeEach(() => {
        mockGetSession.mockResolvedValue({ user: { id: "1" } });
        mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
      });

      it("queries historical weeks and reverses order", async () => {
        mockFindManyWeeks.mockResolvedValue([]);
        mockFindManyPlans.mockResolvedValue([]);
        mockFindManyTimesheets.mockResolvedValue([]);

        await getExportData("forecast-actuals", 2);

        expect(mockFindManyWeeks).toHaveBeenCalledWith({
          where: { week_ending: { lte: expect.any(Date) } },
          orderBy: { week_ending: "desc" },
          take: 2,
        });
      });

      it("exports forecast vs actuals comparison", async () => {
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
            timesheet_entries: [{ hours: 40 }],
          },
        ];
        mockFindManyTimesheets.mockResolvedValue(timesheets);

        const result = (await getExportData(
          "forecast-actuals",
          2,
        )) as ForecastActualsExportRow[];

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          week: "Week 1",
          weekEnding: "Jan 7, 2024",
          forecastHours: 40,
          actualHours: 38,
          variance: -2,
        });
        expect(result[1]).toMatchObject({
          week: "Week 2",
          weekEnding: "Jan 14, 2024",
          forecastHours: 35,
          actualHours: 40,
          variance: 5,
        });
      });

      it("aggregates hours from multiple users", async () => {
        const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
        mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());

        const forecastPlans = [
          {
            forecast_entries: [
              {
                weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 30 }],
              },
            ],
          },
          {
            forecast_entries: [
              {
                weekly_breakdowns: [{ forecast_week_ending_id: 1, hours: 20 }],
              },
            ],
          },
        ];
        mockFindManyPlans.mockResolvedValue(forecastPlans);

        const timesheets = [
          {
            timesheet_week_ending_id: 1,
            timesheet_entries: [{ hours: 25 }, { hours: 10 }],
          },
          {
            timesheet_week_ending_id: 1,
            timesheet_entries: [{ hours: 15 }],
          },
        ];
        mockFindManyTimesheets.mockResolvedValue(timesheets);

        const result = (await getExportData(
          "forecast-actuals",
          1,
        )) as ForecastActualsExportRow[];

        expect(result[0]).toMatchObject({
          forecastHours: 50,
          actualHours: 50,
          variance: 0,
        });
      });

      it("handles weeks with no data", async () => {
        const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
        mockFindManyWeeks.mockResolvedValue([...weekEndings].reverse());
        mockFindManyPlans.mockResolvedValue([]);
        mockFindManyTimesheets.mockResolvedValue([]);

        const result = (await getExportData(
          "forecast-actuals",
          1,
        )) as ForecastActualsExportRow[];

        expect(result[0]).toMatchObject({
          forecastHours: 0,
          actualHours: 0,
          variance: 0,
        });
      });
    });

    describe("error handling", () => {
      it("returns empty array on database error", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "1" } });
        mockFindManyManagers.mockRejectedValue(new Error("Database error"));

        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const result = await getExportData("team");

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error getting export data:",
          expect.any(Error),
        );

        consoleSpy.mockRestore();
      });

      it("handles invalid data type gracefully", async () => {
        mockGetSession.mockResolvedValue({ user: { id: "1" } });
        mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);

        const result = await getExportData("invalid" as any);

        expect(result).toEqual([]);
      });
    });
  });
});
