import type { WeekEnding } from "@/types/timesheet.types";
import { getDayInfo } from "@/utils/timesheet/timesheet.utils";

type TimesheetHeadProps = {
  selectedWeek: WeekEnding;
};

export default function TimesheetHead({ selectedWeek }: TimesheetHeadProps) {
  return (
    <thead>
      <tr className="bg-slate-50 border-b border-slate-200">
        <th className="p-4 text-left font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[250px] sticky left-0 bg-slate-50 z-10">
          Project / Activity
        </th>
        {[0, 1, 2, 3, 4].map((offset) => {
          const dayInfo = getDayInfo(offset, selectedWeek);
          return (
            <th
              key={offset}
              className="px-2 py-3 text-center font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-[90px] max-w-[120px]"
            >
              <div>{dayInfo.shortDay}</div>
              <div className="font-normal mt-1 text-[0.6875rem]">
                {dayInfo.date}
              </div>
            </th>
          );
        })}
        <th className="px-3 py-3 text-center font-semibold text-xs text-slate-600 uppercase tracking-wide min-w-20">
          Total
        </th>
        <th className="min-w-[60px] sticky right-0 bg-slate-50 z-10"></th>
      </tr>
    </thead>
  );
}
