/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    timesheet: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/utils/auth/getSession", () => ({
  getSession: jest.fn(),
}));

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { getTimesheetByWeekEnding } from "../getTimesheetByWeekEnding";

const mockFindUnique = prisma.timesheet.findUnique as unknown as jest.Mock;
const mockGetSession = getSession as unknown as jest.Mock;

describe("getTimesheetByWeekEnding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Unauthorized when session is missing", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getTimesheetByWeekEnding(1);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Timesheet not found when prisma returns null", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getTimesheetByWeekEnding(2);

    expect(result).toEqual({
      success: true,
      data: {
        hasTimesheet: false,
        workItems: [],
        timeEntries: [],
        status: "Draft",
      },
    });
  });

  it("returns success with aggregated totals and bill code summary", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });

    const timesheet = {
      id: 10,
      week_ending: { week_ending: new Date("2025-11-24") },
      status: { name: "Open" },
      submitted_at: null,
      timesheet_entries: [
        {
          hours: 2,
          bill_code_id: "bc1",
          bill_code: {
            id: 101,
            work_item_id: 11,
            bill_code: "BC1",
            bill_name: "Bill 1",
            work_item: {
              id: 11,
              code_id: 1001,
              work_item_code: "WI1",
              description: "One",
              code: { code: "C1", project: { project_name: "P1" } },
            },
          },
          work_date: new Date("2025-11-20"),
        },
        {
          hours: 3,
          bill_code_id: "bc2",
          bill_code: {
            id: 102,
            work_item_id: 12,
            bill_code: "BC2",
            bill_name: "Bill 2",
            work_item: {
              id: 12,
              code_id: 1002,
              work_item_code: "WI2",
              description: "Two",
              code: { code: "C2", project: null },
            },
          },
          work_date: new Date("2025-11-21"),
        },
        {
          hours: 1,
          bill_code_id: "bc1",
          bill_code: {
            id: 101,
            work_item_id: 11,
            bill_code: "BC1",
            bill_name: "Bill 1",
            work_item: {
              id: 11,
              code_id: 1001,
              work_item_code: "WI1",
              description: "One",
              code: { code: "C1", project: { project_name: "P1" } },
            },
          },
          work_date: new Date("2025-11-19"),
        },
      ],
    };

    mockFindUnique.mockResolvedValue(timesheet);

    const result = await getTimesheetByWeekEnding(3);

    expect(result).toHaveProperty("success", true);
    const success = result as unknown as { success: true; data: any };

    expect(success.data.totalHours).toBe(6);
    expect(Array.isArray(success.data.workItems)).toBe(true);
    expect(success.data.workItems.length).toBe(2);

    // timeEntries should include entries keyed by work item id
    expect(Array.isArray(success.data.timeEntries)).toBe(true);
    const te = success.data.timeEntries as Array<any>;
    const te1 = te.find((t) => t.billCodeId === "bc1");
    expect(te1).toBeDefined();
    if (te1) {
      const hours = (Object.values(te1.hours) as number[]).reduce(
        (a, b) => a + b,
        0,
      );
      expect(hours).toBe(3);
    }
  });

  it("returns an error when prisma throws", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockFindUnique.mockImplementation(() => {
      throw new Error("DB failure");
    });

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await getTimesheetByWeekEnding(4);

    expect(result).toEqual({
      success: false,
      error: "Failed to fetch timesheet",
    });
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
