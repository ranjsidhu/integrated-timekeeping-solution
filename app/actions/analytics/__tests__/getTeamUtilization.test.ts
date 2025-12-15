/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
jest.mock("@/utils/auth/getSession");
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    userResourceManagers: { findMany: jest.fn() },
    timesheetWeekEnding: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
  },
}));

import { prisma } from "@/prisma/prisma";
import type { TeamUtilizationResult } from "@/types/analytics.types";
import { getSession } from "@/utils/auth/getSession";
import { getTeamUtilization } from "../getTeamUtilization";

const mockGetSession = getSession as unknown as jest.Mock;
const mockFindManyManagers = prisma.userResourceManagers
  .findMany as unknown as jest.Mock;
const mockFindManyWeeks = prisma.timesheetWeekEnding
  .findMany as unknown as jest.Mock;
const mockFindManyUsers = prisma.user.findMany as unknown as jest.Mock;

describe("getTeamUtilization", () => {
  const emptyResult: TeamUtilizationResult = {
    teamMembers: [],
    weekEndings: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns empty result when no session", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getTeamUtilization();

      expect(result).toEqual(emptyResult);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty result when no user in session", async () => {
      mockGetSession.mockResolvedValue({ user: null });

      const result = await getTeamUtilization();

      expect(result).toEqual(emptyResult);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });

    it("returns empty result when no user id in session", async () => {
      mockGetSession.mockResolvedValue({ user: { id: undefined } });

      const result = await getTeamUtilization();

      expect(result).toEqual(emptyResult);
      expect(mockFindManyManagers).not.toHaveBeenCalled();
    });
  });

  describe("managed users", () => {
    it("returns empty result when no managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([]);

      const result = await getTeamUtilization();

      expect(result).toEqual(emptyResult);
      expect(mockFindManyWeeks).not.toHaveBeenCalled();
    });

    it("queries correct user id for managed users", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "42" } });
      mockFindManyManagers.mockResolvedValue([]);

      await getTeamUtilization();

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
      mockFindManyUsers.mockResolvedValue([]);

      await getTeamUtilization();

      expect(mockFindManyWeeks).toHaveBeenCalledWith({
        where: { week_ending: { gte: expect.any(Date) } },
        orderBy: { week_ending: "asc" },
        take: 4,
      });
    });

    it("queries future week endings with custom weeks", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyUsers.mockResolvedValue([]);

      await getTeamUtilization(8);

      expect(mockFindManyWeeks).toHaveBeenCalledWith({
        where: { week_ending: { gte: expect.any(Date) } },
        orderBy: { week_ending: "asc" },
        take: 8,
      });
    });

    it("queries users with correct filters", async () => {
      mockFindManyWeeks.mockResolvedValue([{ id: 1, week_ending: new Date() }]);
      mockFindManyUsers.mockResolvedValue([]);

      await getTeamUtilization(1);

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

  describe("team member data", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
    });

    it("returns team member basic information", async () => {
      mockFindManyWeeks.mockResolvedValue([
        { id: 1, week_ending: new Date("2024-01-07") },
      ]);

      const users = [
        {
          id: 10,
          name: "Alice Johnson",
          email: "alice@test.com",
          forecast_plans: [],
        },
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(1);

      expect(result.teamMembers).toHaveLength(1);
      expect(result.teamMembers[0]).toMatchObject({
        id: 10,
        name: "Alice Johnson",
        email: "alice@test.com",
      });
    });

    it("calculates weekly hours from forecast breakdowns", async () => {
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
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(2);

      expect(result.teamMembers[0].weeklyHours).toEqual({
        1: 30,
        2: 35,
      });
    });

    it("aggregates hours from multiple forecast entries", async () => {
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

      const result = await getTeamUtilization(1);

      expect(result.teamMembers[0].weeklyHours[1]).toBe(35);
    });

    it("uses only latest submitted forecast plan", async () => {
      const weekEndings = [{ id: 1, week_ending: new Date("2024-01-07") }];
      mockFindManyWeeks.mockResolvedValue(weekEndings);

      const users = [
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
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(1);

      expect(result.teamMembers[0].weeklyHours[1]).toBe(40);
    });

    it("handles team member with no forecast plan", async () => {
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
          forecast_plans: [],
        },
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(2);

      expect(result.teamMembers[0].weeklyHours).toEqual({});
      expect(result.teamMembers[0].averageUtilization).toBe(0);
    });

    it("calculates average utilization correctly", async () => {
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
                    { forecast_week_ending_id: 1, hours: 40 },
                    { forecast_week_ending_id: 2, hours: 32 },
                  ],
                },
              ],
            },
          ],
        },
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(2);

      expect(result.teamMembers[0].averageUtilization).toBe(90);
    });

    it("includes weeks with zero hours in utilization calculation", async () => {
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
                    { forecast_week_ending_id: 1, hours: 40 },
                  ],
                },
              ],
            },
          ],
        },
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(2);

      expect(result.teamMembers[0].averageUtilization).toBe(50);
    });

    it("handles multiple team members", async () => {
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
                    { forecast_week_ending_id: 1, hours: 40 },
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
          forecast_plans: [
            {
              submitted_at: new Date(),
              forecast_entries: [
                {
                  weekly_breakdowns: [
                    { forecast_week_ending_id: 1, hours: 35 },
                  ],
                },
              ],
            },
          ],
        },
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(1);

      expect(result.teamMembers).toHaveLength(2);
      expect(result.teamMembers[0].name).toBe("Alice");
      expect(result.teamMembers[0].weeklyHours[1]).toBe(40);
      expect(result.teamMembers[1].name).toBe("Bob");
      expect(result.teamMembers[1].weeklyHours[1]).toBe(35);
    });
  });

  describe("week endings data", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
      mockFindManyUsers.mockResolvedValue([]);
    });

    it("returns week endings with labels", async () => {
      const weekEndings = [
        { id: 1, week_ending: new Date("2024-01-07") },
        { id: 2, week_ending: new Date("2024-01-14") },
        { id: 3, week_ending: new Date("2024-01-21") },
      ];
      mockFindManyWeeks.mockResolvedValue(weekEndings);

      const result = await getTeamUtilization(3);

      expect(result.weekEndings).toHaveLength(3);
      expect(result.weekEndings[0]).toMatchObject({
        id: 1,
        week_ending: new Date("2024-01-07"),
        label: "W1",
      });
      expect(result.weekEndings[1]).toMatchObject({
        id: 2,
        week_ending: new Date("2024-01-14"),
        label: "W2",
      });
      expect(result.weekEndings[2]).toMatchObject({
        id: 3,
        week_ending: new Date("2024-01-21"),
        label: "W3",
      });
    });

    it("creates sequential week labels", async () => {
      const weekEndings = [
        { id: 5, week_ending: new Date("2024-01-07") },
        { id: 6, week_ending: new Date("2024-01-14") },
        { id: 7, week_ending: new Date("2024-01-21") },
        { id: 8, week_ending: new Date("2024-01-28") },
      ];
      mockFindManyWeeks.mockResolvedValue(weekEndings);

      const result = await getTeamUtilization(4);

      expect(result.weekEndings[0].label).toBe("W1");
      expect(result.weekEndings[1].label).toBe("W2");
      expect(result.weekEndings[2].label).toBe("W3");
      expect(result.weekEndings[3].label).toBe("W4");
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
    });

    it("handles no week endings", async () => {
      mockFindManyWeeks.mockResolvedValue([]);
      mockFindManyUsers.mockResolvedValue([
        {
          id: 10,
          name: "Alice",
          email: "alice@test.com",
          forecast_plans: [],
        },
      ]);

      const result = await getTeamUtilization();

      expect(result.weekEndings).toEqual([]);
      expect(result.teamMembers[0].averageUtilization).toBe(0);
    });

    it("handles forecast breakdowns for weeks not in range", async () => {
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
                    { forecast_week_ending_id: 1, hours: 40 },
                    { forecast_week_ending_id: 99, hours: 30 },
                  ],
                },
              ],
            },
          ],
        },
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(1);

      expect(result.teamMembers[0].weeklyHours).toEqual({
        1: 40,
        99: 30,
      });
    });

    it("calculates utilization with all zero hours", async () => {
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
              forecast_entries: [],
            },
          ],
        },
      ];
      mockFindManyUsers.mockResolvedValue(users);

      const result = await getTeamUtilization(2);

      expect(result.teamMembers[0].averageUtilization).toBe(0);
    });
  });

  describe("error handling", () => {
    it("returns empty result on database error", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getTeamUtilization();

      expect(result).toEqual(emptyResult);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching team utilization:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("handles error during user query", async () => {
      mockGetSession.mockResolvedValue({ user: { id: "1" } });
      mockFindManyManagers.mockResolvedValue([{ user_id: 10 }]);
      mockFindManyWeeks.mockResolvedValue([{ id: 1, week_ending: new Date() }]);
      mockFindManyUsers.mockRejectedValue(new Error("Query error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getTeamUtilization();

      expect(result).toEqual(emptyResult);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
