import type { DayOfWeek, TimeEntry, WeekEnding } from "@/types/timesheet.types";

const getDayInfo = (
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

const getStatusColor = (status?: WeekEnding["status"]) => {
  switch (status) {
    case "Submitted":
      return "blue";
    case "Draft":
      return "gray";
    default:
      return "gray";
  }
};

const calculateTotal = (hours: TimeEntry["hours"]): number => {
  return hours.mon + hours.tue + hours.wed + hours.thu + hours.fri;
};

const calculateDayTotal = (
  day: DayOfWeek,
  timeEntries: TimeEntry[],
): number => {
  return timeEntries.reduce((sum, entry) => sum + (entry.hours[day] || 0), 0);
};

export { calculateTotal, calculateDayTotal, getDayInfo, getStatusColor };
