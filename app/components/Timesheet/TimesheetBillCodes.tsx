import { TrashCan } from "@carbon/icons-react";
import type {
  CodeWithWorkItems,
  DayOfWeek,
  TimeEntry,
} from "@/types/timesheet.types";
import { calculateTotal } from "@/utils/timesheet/timesheet.utils";
import IconButton from "../IconButton/IconButton";
import Input from "../Input/Input";

type TimesheetBillCodesProps = {
  billCodes: CodeWithWorkItems["work_items"][number]["bill_codes"];
  // transient editing buffer map for entries is provided by parent
  editingValues?: Record<string, Partial<Record<DayOfWeek, string>>>;
  onTempChange: (entryId: string, day: DayOfWeek, value: string) => void;
  onCommit: (entryId: string, day: DayOfWeek) => void;
  deleteEntry: (entryId: string) => void;
  entry: TimeEntry;
};

export default function TimesheetBillCodes({
  billCodes,
  entry,
  editingValues,
  onTempChange,
  onCommit,
  deleteEntry,
}: TimesheetBillCodesProps) {
  const getInputValue = (day: DayOfWeek) => {
    const buffered = editingValues?.[entry.id ?? ""]?.[day];
    if (buffered !== undefined) return buffered;
    return entry.hours[day] !== undefined ? String(entry.hours[day]) : "";
  };

  return (
    <>
      {billCodes.map((billCode) => (
        <tr key={billCode.id} className="bg-white border-b border-slate-200">
          <td className="pl-11 pr-4 py-3 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-[#0f62fe] overflow-hidden text-ellipsis whitespace-nowrap">
                  {billCode.bill_code}
                </div>
                <div className="text-slate-600 text-[0.8125rem] mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {billCode.bill_name}
                </div>
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
                min={0}
                hideSteppers
                data-invalid={false}
                value={getInputValue(day)}
                onChange={(e) => {
                  onTempChange(entry.id ?? "", day, e.currentTarget.value);
                }}
                onBlur={() => onCommit(entry.id ?? "", day)}
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
      ))}
    </>
  );
}
