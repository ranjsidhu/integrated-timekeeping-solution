import type { DayOfWeek, TimeEntry, WeekEnding } from "@/types/timesheet.types";

const getDayInfo = (
  offset: number,
  selectedWeek: WeekEnding,
): { shortDay: string; date: string; fullDate: string } => {
  const date = new Date(selectedWeek.date);
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
    case "submitted":
      return "blue";
    case "saved":
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

const generateWeekEndings = (): WeekEnding[] => {
  const weeks: WeekEnding[] = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (today.getDay() + 7 * i - 5));

    weeks.push({
      id: `week-${i}`,
      label: date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      date: date,
      status: i === 0 ? "draft" : i === 1 ? "submitted" : "approved",
    });
  }

  return weeks;
};

export {
  calculateTotal,
  calculateDayTotal,
  getDayInfo,
  getStatusColor,
  generateWeekEndings,
};
