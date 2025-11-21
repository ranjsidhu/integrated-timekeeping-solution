import { TrashCan } from "@carbon/icons-react";
import type { DayOfWeek, TimeEntry, WorkItem } from "@/types/timesheet.types";
import { calculateTotal } from "@/utils/timesheet/timesheet.utils";
import IconButton from "../IconButton/IconButton";
import Input from "../Input/Input";

type TimesheetWorkItemsProps = {
  entry: TimeEntry;
  workItem: WorkItem;
  deleteEntry: (entryId: string) => void;
  updateHours: (entryId: string, day: DayOfWeek, value: string) => void;
};

export default function TimesheetWorkItems({
  entry,
  workItem,
  deleteEntry,
  updateHours,
}: TimesheetWorkItemsProps) {
  return (
    <tr key={entry.id} className="bg-slate-50 border-b border-slate-200">
      <td className="pl-12 pr-4 py-3 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        <div className="min-w-0">
          <div className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">
            {workItem.workItemCode}
          </div>
          <div className="text-slate-600 text-[0.8125rem] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
            {workItem.description}
          </div>
        </div>
      </td>
      {(["mon", "tue", "wed", "thu", "fri"] as DayOfWeek[]).map((day) => (
        <td
          key={day}
          className="p-2 text-center border-r border-slate-200 w-14"
        >
          <Input
            id={`${entry.id}-${day}-hours`}
            pattern="[0-9]*"
            type="number"
            hideSteppers
            min={0}
            max={24}
            value={entry.hours[day] ?? ""}
            onChange={(e) =>
              entry.id && updateHours(entry.id, day, e.currentTarget.value)
            }
          />
        </td>
      ))}
      <td className="px-4 py-2 text-center font-semibold text-sm bg-slate-100 border-r border-slate-200">
        {calculateTotal(entry.hours)}
      </td>
      <td className="p-2 text-center sticky right-0 bg-slate-50 z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        <IconButton
          label="Delete entry"
          kind="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            entry.id && deleteEntry(entry.id);
          }}
        >
          <TrashCan size={16} />
        </IconButton>
      </td>
    </tr>
  );
}
