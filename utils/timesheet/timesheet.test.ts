/** biome-ignore-all lint/suspicious/noTsIgnore: Unit tests */
import type {
  DayHours,
  DayOfWeek,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";

import {
  calculateDayTotal,
  calculateTotal,
  getDayInfo,
  getStatusColor,
} from "./timesheet.utils";

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
          billCodeId: "b1",
          hours: { mon: 1, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "2",
          billCodeId: "b2",
          hours: { mon: 2, tue: 3, wed: 0, thu: 0, fri: 0 },
        },
        {
          id: "3",
          billCodeId: "b3",
          hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
        },
      ];

      expect(calculateDayTotal("mon" as DayOfWeek, entries)).toBe(3);
      expect(calculateDayTotal("tue" as DayOfWeek, entries)).toBe(3);

      // day not present should return 0
      expect(calculateDayTotal("wed" as DayOfWeek, entries)).toBe(0);
    });
  });
});
