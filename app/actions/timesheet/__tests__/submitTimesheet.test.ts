/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    timesheetStatus: { findFirst: jest.fn() },
    timesheet: { updateMany: jest.fn() },
  },
}));

jest.mock("../saveTimesheet", () => ({
  saveTimesheet: jest.fn(),
}));

jest.mock("@/utils/timesheet/timesheet.validation", () => ({
  validateTimesheetSubmission: jest.fn(),
}));

import { prisma } from "@/prisma/prisma";
import { validateTimesheetSubmission } from "@/utils/timesheet/timesheet.validation";
import { saveTimesheet } from "../saveTimesheet";
import { submitTimesheet } from "../submitTimesheet";

const mockFindFirst = prisma.timesheetStatus.findFirst as unknown as jest.Mock;
const mockUpdateMany = prisma.timesheet.updateMany as unknown as jest.Mock;
const mockSave = saveTimesheet as unknown as jest.Mock;
const mockValidate = validateTimesheetSubmission as unknown as jest.Mock;

describe("submitTimesheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful validation by default
    mockValidate.mockResolvedValue({ isValid: true, errors: [] });
  });

  it("calls saveTimesheet and updates timesheet status", async () => {
    mockSave.mockResolvedValue({});
    const submittedStatus = { id: 77, name: "Submitted" };
    mockFindFirst.mockResolvedValue(submittedStatus);
    mockUpdateMany.mockResolvedValue({ count: 1 });

    const selectedWeek = {
      id: 5,
      week_ending: new Date().toISOString(),
    } as any;
    const timeEntries: any[] = [];

    const result = await submitTimesheet(selectedWeek, timeEntries);

    expect(result).toEqual({ success: true, status: "Submitted" });
    expect(mockValidate).toHaveBeenCalledWith(timeEntries, expect.any(Date));
    expect(mockSave).toHaveBeenCalledWith(selectedWeek, timeEntries);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { name: "Submitted" },
    });
    expect(mockUpdateMany).toHaveBeenCalled();
    const callArg = mockUpdateMany.mock.calls[0][0];
    expect(callArg.where.timesheet_week_ending_id).toBe(selectedWeek.id);
    expect(callArg.data.status_id).toBe(submittedStatus.id);
    expect(callArg.data.submitted_at).toBeInstanceOf(Date);
  });

  it("returns validation errors when validation fails", async () => {
    const validationErrors = [{ message: "Bill code has expired" }];
    mockValidate.mockResolvedValue({
      isValid: false,
      errors: validationErrors,
    });

    const selectedWeek = {
      id: 6,
      week_ending: new Date().toISOString(),
    } as any;

    const result = await submitTimesheet(selectedWeek, []);

    expect(result).toEqual({
      success: false,
      validationErrors,
      message:
        "Cannot submit timesheet. Please check the following issues and try again.",
    });
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("returns null when submitted status not found", async () => {
    mockSave.mockResolvedValue({});
    mockFindFirst.mockResolvedValue(null);

    const selectedWeek = {
      id: 7,
      week_ending: new Date().toISOString(),
    } as any;

    const result = await submitTimesheet(selectedWeek, []);

    expect(result).toBeNull();
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("returns null when saveTimesheet throws", async () => {
    mockSave.mockImplementation(() => {
      throw new Error("save failed");
    });

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const selectedWeek = {
      id: 8,
      week_ending: new Date().toISOString(),
    } as any;
    const result = await submitTimesheet(selectedWeek, []);

    expect(result).toBeNull();
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
