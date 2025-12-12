import type { DayOfWeek, TimesheetTotalsProps } from "@/types/timesheet.types";
import {
  calculateDayTotal,
  calculateTotal,
} from "@/utils/timesheet/timesheet.utils";

export default function TimesheetTotals({ timeEntries }: TimesheetTotalsProps) {
  return (
    <tr className="bg-slate-200 font-semibold border-t-2 border-slate-700">
      <td className="p-4 text-sm sticky left-0 bg-slate-200 z-10">Total</td>
      {(["mon", "tue", "wed", "thu", "fri"] as DayOfWeek[]).map((day) => (
        <td key={day} className="px-3 py-4 text-center text-sm">
          {calculateDayTotal(day, timeEntries)}
        </td>
      ))}
      <td className="px-3 py-4 text-center text-sm">
        {timeEntries.reduce(
          (sum, entry) => sum + calculateTotal(entry.hours),
          0,
        )}
      </td>
      <td className="sticky right-0 bg-slate-200 z-10"></td>
    </tr>
  );
}
