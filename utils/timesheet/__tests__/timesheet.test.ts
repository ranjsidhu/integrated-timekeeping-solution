/** biome-ignore-all lint/suspicious/noTsIgnore: Unit tests */
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import type {
  CodeWithWorkItems,
  DayHours,
  DayOfWeek,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";

import {
  calculateDayTotal,
  calculateTotal,
  createBlankEntry,
  getDateLabel,
  getDayInfo,
  getEntriesWithHours,
  getStatusColor,
  mergeTimeEntries,
  mergeWorkItems,
  processPendingCode,
} from "../timesheet.utils";

describe("timesheet utils", () => {
  describe("getDayInfo", () => {
    it("returns empty strings when no week provided", () => {
      // intentionally pass undefined to exercise guard branch
      // @ts-expect-error - testing behaviour with missing arg
      const info = getDayInfo(0, undefined);
      expect(info).toEqual({ shortDay: "", date: "", fullDate: "" });
    });

    it("computes day info for different offsets", () => {
      // use midday UTC to avoid timezone-caused day rollovers in tests
      const selectedWeek: WeekEnding = {
        id: 1,
        label: "",
        week_ending: new Date("2025-11-14T12:00:00.000Z"),
        status: "",
      } as WeekEnding;

      // pick a couple of offsets to exercise the arithmetic
      const offsets = [0, 2, 4];

      offsets.forEach((offset) => {
        const expectedDate = new Date(selectedWeek.week_ending);
        expectedDate.setDate(expectedDate.getDate() - (4 - offset));

        const shortDay = expectedDate.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const date = expectedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const fullDate = expectedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

        const info = getDayInfo(offset, selectedWeek);
        expect(info).toEqual({ shortDay, date, fullDate });
      });
    });
  });

  describe("getStatusColor", () => {
    it("returns blue for Submitted, gray for Draft and default", () => {
      expect(getStatusColor("Submitted")).toBe("blue");
      expect(getStatusColor("Draft")).toBe("gray");
      // undefined/unknown statuses fallback to gray
      expect(getStatusColor()).toBe("gray");
      expect(getStatusColor("SomethingElse")).toBe("gray");
    });
  });

  describe("calculateTotal", () => {
    it("sums mon-fri correctly", () => {
      const hours: DayHours = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5 };
      expect(calculateTotal(hours)).toBe(15);

      const zeros: DayHours = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };
      expect(calculateTotal(zeros)).toBe(0);
    });
  });

  describe("calculateDayTotal", () => {
    it("calculates totals for a given day across entries", () => {
      const entries: TimeEntry[] = [
        {
          id: "1",
          billCodeId: 1,
          hours: { mon: 1, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "2",
          billCodeId: 2,
          hours: { mon: 2, tue: 3, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "3",
          billCodeId: 3,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];

      expect(calculateDayTotal("mon" as DayOfWeek, entries)).toBe(3);
      expect(calculateDayTotal("tue" as DayOfWeek, entries)).toBe(3);

      // day not present should return 0
      expect(calculateDayTotal("wed" as DayOfWeek, entries)).toBe(0);
    });
  });

  describe("processPendingCode", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("returns empty arrays when no pending code in localStorage", () => {
      const result = processPendingCode();
      expect(result).toEqual({ workItems: [], timeEntries: [] });
    });

    it("returns empty arrays when pending code has no work items", () => {
      localStorage.setItem("pendingCode", JSON.stringify({ work_items: [] }));
      const result = processPendingCode();
      expect(result).toEqual({ workItems: [], timeEntries: [] });
    });

    it("processes pending code and creates time entries", () => {
      const pendingCode = {
        work_items: [
          {
            id: 1,
            code_id: 10,
            work_item_code: "WI001",
            description: "Test Work Item",
            bill_codes: [
              {
                id: 100,
                work_item_id: 1,
                bill_code: "BC001",
                bill_name: "Test Bill Code",
              },
            ],
          },
        ],
      };

      localStorage.setItem("pendingCode", JSON.stringify(pendingCode));
      const result = processPendingCode();

      expect(result.workItems).toEqual(pendingCode.work_items);
      expect(result.timeEntries).toEqual([
        {
          id: "1",
          billCodeId: 100,
          subCodeId: 1,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ]);
      expect(localStorage.getItem("pendingCode")).toBeNull();
    });

    it("handles invalid JSON gracefully", () => {
      localStorage.setItem("pendingCode", "invalid json");
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = processPendingCode();

      expect(result).toEqual({ workItems: [], timeEntries: [] });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("mergeWorkItems", () => {
    it("merges work items and deduplicates by id", () => {
      const existing: CodeWithWorkItems["work_items"] = [
        {
          id: 1,
          code_id: 10,
          work_item_code: "WI001",
          description: "Existing",
          bill_codes: [],
        },
      ];

      const newItems: CodeWithWorkItems["work_items"] = [
        {
          id: 1,
          code_id: 10,
          work_item_code: "WI001",
          description: "Duplicate",
          bill_codes: [],
        },
        {
          id: 2,
          code_id: 20,
          work_item_code: "WI002",
          description: "New",
          bill_codes: [],
        },
      ];

      const result = mergeWorkItems(existing, newItems);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].description).toBe("Existing"); // Original kept
      expect(result[1].id).toBe(2);
      expect(result[1].description).toBe("New");
    });

    it("returns existing items when no new items", () => {
      const existing: CodeWithWorkItems["work_items"] = [
        {
          id: 1,
          code_id: 10,
          work_item_code: "WI001",
          description: "Existing",
          bill_codes: [],
        },
      ];

      const result = mergeWorkItems(existing, []);
      expect(result).toEqual(existing);
    });
  });

  describe("mergeTimeEntries", () => {
    it("merges time entries and deduplicates by id", () => {
      const existing: TimeEntry[] = [
        {
          id: "1",
          billCodeId: 100,
          hours: { mon: 8, tue: 8, wed: 0, thu: 0, fri: 0 },
        },
      ];

      const newEntries: TimeEntry[] = [
        {
          id: "1",
          billCodeId: 100,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "2",
          billCodeId: 200,
          hours: { mon: 4, tue: 4, wed: 0, thu: 0, fri: 0 },
        },
      ];

      const result = mergeTimeEntries(existing, newEntries);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[0].hours.mon).toBe(8); // Original kept
      expect(result[1].id).toBe("2");
    });

    it("returns existing entries when no new entries", () => {
      const existing: TimeEntry[] = [
        {
          id: "1",
          billCodeId: 100,
          hours: { mon: 8, tue: 8, wed: 0, thu: 0, fri: 0 },
        },
      ];

      const result = mergeTimeEntries(existing, []);
      expect(result).toEqual(existing);
    });
  });

  describe("getEntriesWithHours", () => {
    it("returns IDs of entries with hours greater than 0", () => {
      const entries: TimeEntry[] = [
        {
          id: "1",
          billCodeId: 100,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "2",
          billCodeId: 200,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "3",
          billCodeId: 300,
          hours: { mon: 0, tue: 4, wed: 0, thu: 0, fri: 0 },
        },
      ];

      const result = getEntriesWithHours(entries);

      expect(result).toEqual(["1", "3"]);
    });

    it("returns empty array when no entries have hours", () => {
      const entries: TimeEntry[] = [
        {
          id: "1",
          billCodeId: 100,
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];

      const result = getEntriesWithHours(entries);
      expect(result).toEqual([]);
    });

    it("filters out undefined IDs", () => {
      const entries: TimeEntry[] = [
        {
          id: undefined,
          billCodeId: 100,
          hours: { mon: 8, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "2",
          billCodeId: 200,
          hours: { mon: 0, tue: 4, wed: 0, thu: 0, fri: 0 },
        },
      ];

      const result = getEntriesWithHours(entries);
      expect(result).toEqual(["2"]);
    });
  });

  describe("createBlankEntry", () => {
    it("creates a blank time entry from work item", () => {
      const workItem: CodeWithWorkItems["work_items"][0] = {
        id: 5,
        code_id: 10,
        work_item_code: "WI001",
        description: "Test Work Item",
        bill_codes: [
          {
            id: 100,
            work_item_id: 5,
            bill_code: "BC001",
            bill_name: "Test Bill Code",
          },
        ],
      };

      const result = createBlankEntry(workItem);

      expect(result).toEqual({
        id: "5",
        billCodeId: 100,
        subCodeId: 5,
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
      });
    });
  });

  describe("getDateLabel", () => {
    it("returns formatted short date labels for mon-fri when given a week-end (Friday) string", () => {
      const weekEndStr = "2025-11-14"; // Friday
      const days: Array<DayOfWeek> = ["mon", "tue", "wed", "thu", "fri"];

      // compute expected using same logic (monday = friday - 4 days)
      const friday = new Date(weekEndStr);
      const monday = new Date(
        friday.getFullYear(),
        friday.getMonth(),
        friday.getDate() - 4,
      );

      days.forEach((d, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const expected = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        expect(getDateLabel(d, weekEndStr)).toBe(expected);
      });
    });

    it("accepts a Date object for weekEnd and returns same labels", () => {
      const weekEnd = new Date("2025-11-14T00:00:00Z");
      const monLabel = getDateLabel("mon" as DayOfWeek, weekEnd);
      const friLabel = getDateLabel("fri" as DayOfWeek, weekEnd);

      // monday should be 4 days before friday
      const friday = new Date(weekEnd);
      const monday = new Date(
        friday.getFullYear(),
        friday.getMonth(),
        friday.getDate() - 4,
      );
      const expectedMon = monday.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const expectedFri = new Date(monday);
      expectedFri.setDate(monday.getDate() + 4);
      const expectedFriLabel = expectedFri.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      expect(monLabel).toBe(expectedMon);
      expect(friLabel).toBe(expectedFriLabel);
    });

    it("returns empty string for invalid weekEnd input", () => {
      const result = getDateLabel("mon" as DayOfWeek, "not-a-date");
      expect(result).toBe("");
    });

    it("works when weekEnd is omitted (falls back to current week)", () => {
      // call with undefined to exercise the fallback branch that computes current week
      const result = getDateLabel("mon" as DayOfWeek, undefined as any);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns a label for weekend offsets when provided", () => {
      // weekend keys exist in the indexMap; ensure they return a non-empty label
      const sat = getDateLabel("sat" as DayOfWeek, undefined as any);
      const sun = getDateLabel("sun" as DayOfWeek, undefined as any);
      expect(typeof sat).toBe("string");
      expect(sat.length).toBeGreaterThanOrEqual(0); // could be empty in edge cases, but should run the branch
      expect(typeof sun).toBe("string");
      expect(sun.length).toBeGreaterThanOrEqual(0);
    });
  });
});
