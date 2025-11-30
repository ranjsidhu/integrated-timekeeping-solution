import type {
  CodeWithWorkItems,
  DayOfWeek,
  TimeEntry,
  WeekEnding,
} from "@/types/timesheet.types";

/**
 * Get day information for a specific offset from the week ending date
 * @param offset - Number of days before Friday (0 = Monday, 4 = Friday)
 * @param selectedWeek - The selected week ending object
 * @returns Object containing short day name, formatted date, and full date
 */
export const getDayInfo = (
  offset: number,
  selectedWeek: WeekEnding,
): { shortDay: string; date: string; fullDate: string } => {
  if (!selectedWeek) {
    return { shortDay: "", date: "", fullDate: "" };
  }
  const date = new Date(selectedWeek.week_ending);
  date.setDate(date.getDate() - (4 - offset));
  return {
    shortDay: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    fullDate: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }),
  };
};

/**
 * Get the color tag type based on timesheet status
 * @param status - The current status of the timesheet
 * @returns Color string for the Carbon tag component
 */
export const getStatusColor = (status?: WeekEnding["status"]) => {
  switch (status) {
    case "Submitted":
      return "blue";
    case "Draft":
      return "gray";
    default:
      return "gray";
  }
};

/**
 * Calculate total hours for a single time entry across all days
 * @param hours - DayHours object containing hours for each day
 * @returns Total sum of hours
 */
export const calculateTotal = (hours: TimeEntry["hours"]): number => {
  return (
    (hours.mon || 0) +
    (hours.tue || 0) +
    (hours.wed || 0) +
    (hours.thu || 0) +
    (hours.fri || 0)
  );
};

/**
 * Calculate total hours for a specific day across all time entries
 * @param day - The day of week to calculate (mon, tue, wed, thu, fri)
 * @param timeEntries - Array of all time entries
 * @returns Total hours for the specified day
 */
export const calculateDayTotal = (
  day: DayOfWeek,
  timeEntries: TimeEntry[],
): number => {
  return timeEntries.reduce((sum, entry) => sum + (entry.hours[day] || 0), 0);
};

/**
 * Process pending code from localStorage
 */
export function processPendingCode(): {
  workItems: CodeWithWorkItems["work_items"];
  timeEntries: TimeEntry[];
} {
  const pendingCodeStr = localStorage.getItem("pendingCode");

  if (!pendingCodeStr) {
    return { workItems: [], timeEntries: [] };
  }

  try {
    const pendingCode = JSON.parse(pendingCodeStr);

    if (!pendingCode.work_items?.length) {
      return { workItems: [], timeEntries: [] };
    }

    const workItems = pendingCode.work_items;
    const timeEntries = pendingCode.work_items.map(
      (workItem: (typeof pendingCode.work_items)[0]) => ({
        id: workItem.id.toString(),
        billCodeId: workItem.bill_codes[0].id,
        subCodeId: workItem.id,
        hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
      }),
    );

    localStorage.removeItem("pendingCode");
    return { workItems, timeEntries };
  } catch (error) {
    console.error("Error processing pending code:", error);
    return { workItems: [], timeEntries: [] };
  }
}

/**
 * Merge and deduplicate work items
 */
export function mergeWorkItems(
  existing: CodeWithWorkItems["work_items"],
  newItems: CodeWithWorkItems["work_items"],
): CodeWithWorkItems["work_items"] {
  const existingIds = new Set(existing.map((w) => w.id));
  const uniqueNewItems = newItems.filter((w) => !existingIds.has(w.id));
  return [...existing, ...uniqueNewItems];
}

/**
 * Merge and deduplicate time entries
 */
export function mergeTimeEntries(
  existing: TimeEntry[],
  newEntries: TimeEntry[],
): TimeEntry[] {
  const existingIds = new Set(existing.map((e) => e.id));
  const uniqueNewEntries = newEntries.filter((e) => !existingIds.has(e.id));
  return [...existing, ...uniqueNewEntries];
}

/**
 * Get IDs of entries that have hours logged
 */
export function getEntriesWithHours(entries: TimeEntry[]): string[] {
  return entries
    .filter((entry) => {
      return Object.values(entry.hours).some((h: number) => h > 0);
    })
    .map((entry) => entry.id)
    .filter((id): id is string => id !== undefined);
}

/**
 * Create blank time entry from work item
 */
export function createBlankEntry(
  workItem: CodeWithWorkItems["work_items"][0],
): TimeEntry {
  return {
    id: workItem.id.toString(),
    billCodeId: workItem.bill_codes[0].id,
    subCodeId: workItem.id,
    hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
  };
}

/**
 *
 * @param d - day of week string ("mon", "tue", etc.)
 * @param weekEnd - date string or Date object representing week ending date
 * @returns formatted date label (e.g., "Jan 1")
 */
export const getDateLabel = (d: DayOfWeek, weekEnd: Date | string) => {
  try {
    const indexMap: Record<DayOfWeek, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
      sat: 5,
      sun: 6,
    } as const;

    // derive monday either from weekEnd prop (assumed Friday) or calculate from now
    let monday: Date;
    if (weekEnd) {
      const d =
        typeof weekEnd === "string" ? new Date(weekEnd) : new Date(weekEnd);
      // If the parsed date is invalid, return empty string to match guard behaviour
      if (Number.isNaN(d.getTime())) return "";
      // assume the passed date is the week-ending Friday; monday = friday - 4 days
      monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 4);
      monday.setHours(0, 0, 0, 0);
    } else {
      const now = new Date();
      const isoDay = (now.getDay() + 6) % 7; // 0 = Monday
      monday = new Date(now);
      monday.setDate(now.getDate() - isoDay);
      monday.setHours(0, 0, 0, 0);
    }

    const offset = indexMap[d] ?? 0;
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};
