jest.mock("@/prisma/prisma", () => ({
  prisma: {
    timesheetStatus: { findFirst: jest.fn() },
    timesheet: { upsert: jest.fn() },
    timesheetEntry: { deleteMany: jest.fn(), createMany: jest.fn() },
  },
}));

jest.mock("@/utils/auth/getSession", () => ({
  getSession: jest.fn(),
}));

import { prisma } from "@/prisma/prisma";
import type { TimeEntry, WeekEnding } from "@/types/timesheet.types";
import { getSession } from "@/utils/auth/getSession";
import { saveTimesheet } from "../saveTimesheet";

const mockFindFirst = prisma.timesheetStatus.findFirst as unknown as jest.Mock;
const mockUpsert = prisma.timesheet.upsert as unknown as jest.Mock;
const mockDeleteMany = prisma.timesheetEntry.deleteMany as unknown as jest.Mock;
const mockCreateMany = prisma.timesheetEntry.createMany as unknown as jest.Mock;
const mockGetSession = getSession as unknown as jest.Mock;

describe("saveTimesheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when session is missing (Unauthorized)", async () => {
    mockGetSession.mockResolvedValue(null);

    const selectedWeek = {
      id: 1,
      week_ending: new Date().toISOString(),
    } as unknown as WeekEnding;

    const result = await saveTimesheet(selectedWeek, [] as TimeEntry[]);

    expect(result).toBeNull();
  });

  it("returns null and logs when draft status not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1", email: "a@b.com" } });
    mockFindFirst.mockResolvedValue(null);

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const selectedWeek = {
      id: 2,
      week_ending: new Date().toISOString(),
    } as unknown as WeekEnding;

    const result = await saveTimesheet(selectedWeek, [] as TimeEntry[]);

    expect(result).toBeNull();
    expect(mockFindFirst).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it("creates entries and returns timesheet when entries exist", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "42", email: "user@example.com" },
    });
    mockFindFirst.mockResolvedValue({ id: 99 });

    const upsertResult = { id: 123 };
    mockUpsert.mockResolvedValue(upsertResult);
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreateMany.mockResolvedValue({ count: 5 });

    const selectedWeek = {
      id: 3,
      week_ending: new Date("2025-11-28").toISOString(),
    } as unknown as WeekEnding;

    const timeEntries: TimeEntry[] = [
      {
        billCodeId: "BC-1",
        hours: { mon: 1, tue: 0, wed: 2, thu: 0, fri: 0 },
      } as unknown as TimeEntry,
    ];

    const result = await saveTimesheet(selectedWeek, timeEntries);

    expect(result).toEqual(upsertResult);
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { timesheet_id: upsertResult.id },
    });

    // createMany should be called with 5 entries for one timeEntries (mon..fri)
    expect(mockCreateMany).toHaveBeenCalled();
    const createArgs = mockCreateMany.mock.calls[0][0];
    expect(Array.isArray(createArgs.data)).toBe(true);
    expect(createArgs.data.length).toBe(5);

    // Verify one of the created rows contains the expected bill_code_id and timesheet_id
    const anyRow = createArgs.data.find(
      (r: { bill_code_id: string }) => r.bill_code_id === "BC-1",
    );
    expect(anyRow).toBeDefined();
    if (anyRow) {
      expect(anyRow.timesheet_id).toBe(upsertResult.id);
    }
  });

  it("does not call createMany when no entries provided", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "99", email: "x@y.com" } });
    mockFindFirst.mockResolvedValue({ id: 7 });
    mockUpsert.mockResolvedValue({ id: 555 });
    mockDeleteMany.mockResolvedValue({ count: 0 });

    const selectedWeek = {
      id: 4,
      week_ending: new Date().toISOString(),
    } as unknown as WeekEnding;

    const result = await saveTimesheet(selectedWeek, [] as TimeEntry[]);

    expect(result).toEqual({ id: 555 });
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockDeleteMany).toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });
});
