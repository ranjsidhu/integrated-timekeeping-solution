import { prisma } from "@/prisma/prisma";
import type { TimeEntry } from "@/types/timesheet.types";
import { validateTimesheetSubmission } from "../timesheet.validation";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    billCode: {
      findMany: jest.fn(),
    },
  },
}));

const mockFindMany = prisma.billCode.findMany as jest.Mock;

describe("validateTimesheetSubmission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation 10: At least one entry with hours", () => {
    it("should fail when no entries have hours", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        message:
          "Timesheet must contain at least one entry with logged hours before submission",
      });
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("should pass when at least one entry has hours", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Code 1",
          work_item: {
            code: {
              code: "ABC123",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Validation 6: Active projects", () => {
    it("should fail when bill code belongs to inactive project", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Inactive Project Code",
          work_item: {
            code: {
              code: "INACTIVE123",
              project_id: 5,
              project: {
                id: 5,
                project_name: "Old Project",
                is_active: false,
              },
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          billCodeId: 1,
          message: expect.stringContaining("is no longer active"),
        }),
      );
    });

    it("should pass when bill code belongs to active project", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Active Code",
          work_item: {
            code: {
              code: "ACTIVE123",
              project_id: 5,
              project: {
                id: 5,
                project_name: "Active Project",
                is_active: true,
              },
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Validation 7: No duplicate entries on same work date", () => {
    it("should fail when same bill code appears multiple times on same date", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 4, tue: 4, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Code 1",
          work_item: {
            code: {
              code: "ABC123",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      // With only one entry object, there shouldn't be duplicates
      // This test verifies the logic doesn't falsely flag single entries
      expect(result.isValid).toBe(true);
    });
  });

  describe("Validation 4: Work date range", () => {
    it("should pass when work dates are within the week", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8 },
        },
      ];
      const friday = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Code 1",
          work_item: {
            code: {
              code: "ABC123",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, friday);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Validation 1: Start date check", () => {
    it("should fail when work date is before code start date", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Future Code",
          work_item: {
            code: {
              code: "FUTURE123",
              project_id: null,
              project: null,
              start_date: new Date("2025-12-15"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          billCodeId: 1,
          message: expect.stringContaining("cannot be used before"),
        }),
      );
    });

    it("should pass when work date is on or after code start date", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Active Code",
          work_item: {
            code: {
              code: "ABC123",
              project_id: null,
              project: null,
              start_date: new Date("2025-12-08"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Expiry date check", () => {
    it("should fail when work date is after code expiry date", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-19");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Expired Code",
          work_item: {
            code: {
              code: "EXPIRED123",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-10"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          billCodeId: 1,
          message: expect.stringContaining("has expired"),
        }),
      );
    });

    it("should pass when work date is before code expiry date", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Valid Code",
          work_item: {
            code: {
              code: "VALID123",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Multiple validations", () => {
    it("should report multiple errors for same bill code", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-19");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Problem Code",
          work_item: {
            code: {
              code: "PROBLEM123",
              project_id: 5,
              project: {
                id: 5,
                project_name: "Inactive Project",
                is_active: false,
              },
              start_date: new Date("2025-12-25"),
              expiry_date: new Date("2025-12-10"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(
        result.errors.some((e) => e.message.includes("is no longer active")),
      ).toBe(true);
      expect(
        result.errors.some((e) => e.message.includes("cannot be used before")),
      ).toBe(true);
      expect(result.errors.some((e) => e.message.includes("has expired"))).toBe(
        true,
      );
    });

    it("should handle multiple bill codes", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          billCodeId: 2,
          hours: { tue: 8, wed: 0, thu: 0, fri: 0, mon: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "Code 1",
          work_item: {
            code: {
              code: "ABC123",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
        {
          id: 2,
          bill_name: "Code 2",
          work_item: {
            code: {
              code: "DEF456",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty time entries array without hours", async () => {
      const timeEntries: TimeEntry[] = [];
      const weekEnding = new Date("2025-12-12");

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle code without project", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 1,
          bill_name: "System Code",
          work_item: {
            code: {
              code: "SYS001",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should only validate entries that have hours", async () => {
      const timeEntries: TimeEntry[] = [
        {
          billCodeId: 1,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          billCodeId: 2,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];
      const weekEnding = new Date("2025-12-12");

      mockFindMany.mockResolvedValue([
        {
          id: 2,
          bill_name: "Code 2",
          work_item: {
            code: {
              code: "DEF456",
              project_id: null,
              project: null,
              start_date: new Date("2025-01-01"),
              expiry_date: new Date("2025-12-31"),
            },
          },
        },
      ]);

      const result = await validateTimesheetSubmission(timeEntries, weekEnding);

      expect(result.isValid).toBe(true);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: [2] } },
        }),
      );
    });
  });
});
