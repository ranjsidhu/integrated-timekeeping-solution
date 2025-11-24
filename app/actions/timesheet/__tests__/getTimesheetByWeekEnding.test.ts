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

type BillCodeSummaryItem = {
  bill_code: string;
  bill_name: string;
  work_item_code: string;
  code: string;
  project_name: string;
  total_hours: number;
  daily_breakdown: { work_date: string | Date; hours: number }[];
};

type SuccessData = {
  timesheet: {
    id: number;
    week_ending: Date;
    status: string;
    submitted_at: null | string;
    total_hours: number;
  };
  entries: unknown[];
  bill_code_summary: BillCodeSummaryItem[];
};

type SuccessResult = { success: true; data: SuccessData };

describe("getTimesheetByWeekEnding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Unauthorized when session is missing", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getTimesheetByWeekEnding(1);

    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns Timesheet not found when prisma returns null", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getTimesheetByWeekEnding(2);

    expect(result).toEqual({ error: "Timesheet not found" });
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
            bill_code: "BC1",
            bill_name: "Bill 1",
            work_item: {
              work_item_code: "WI1",
              code: { code: "C1", project: { project_name: "P1" } },
            },
          },
          work_date: new Date("2025-11-20"),
        },
        {
          hours: 3,
          bill_code_id: "bc2",
          bill_code: {
            bill_code: "BC2",
            bill_name: "Bill 2",
            work_item: {
              work_item_code: "WI2",
              code: { code: "C2", project: null },
            },
          },
          work_date: new Date("2025-11-21"),
        },
        {
          hours: 1,
          bill_code_id: "bc1",
          bill_code: {
            bill_code: "BC1",
            bill_name: "Bill 1",
            work_item: {
              work_item_code: "WI1",
              code: { code: "C1", project: { project_name: "P1" } },
            },
          },
          work_date: new Date("2025-11-22"),
        },
      ],
    };

    mockFindUnique.mockResolvedValue(timesheet);

    const result = await getTimesheetByWeekEnding(3);

    expect(result).toHaveProperty("success", true);
    const success = result as SuccessResult;

    expect(success.data.timesheet.total_hours).toBe(6);
    expect(Array.isArray(success.data.bill_code_summary)).toBe(true);

    const summary = success.data.bill_code_summary;
    expect(summary).toHaveLength(2);

    const bc1 = summary.find((b) => b.bill_code === "BC1");
    expect(bc1).toBeDefined();
    if (bc1) {
      expect(bc1.total_hours).toBe(3);
      expect(bc1.project_name).toBe("P1");
    }

    const bc2 = summary.find((b) => b.bill_code === "BC2");
    expect(bc2).toBeDefined();
    if (bc2) {
      expect(bc2.project_name).toBe("N/A");
    }
  });

  it("returns an error when prisma throws", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockFindUnique.mockImplementation(() => {
      throw new Error("DB failure");
    });

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await getTimesheetByWeekEnding(4);

    expect(result).toEqual({ error: "Failed to fetch timesheet" });
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
