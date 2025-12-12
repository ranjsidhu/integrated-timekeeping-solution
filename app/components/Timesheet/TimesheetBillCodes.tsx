import { TrashCan } from "@carbon/icons-react";
import { Fragment } from "react";
import type {
  DayOfWeek,
  TimesheetBillCodesProps,
} from "@/types/timesheet.types";
import { calculateTotal } from "@/utils/timesheet/timesheet.utils";
import IconButton from "../IconButton/IconButton";
import Input from "../Input/Input";

export default function TimesheetBillCodes({
  billCodes,
  entry,
  editingValues,
  onTempChange,
  onCommit,
  deleteEntry,
}: TimesheetBillCodesProps) {
  const days: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri"];

  const getInputValue = (day: DayOfWeek) => {
    const buffered = editingValues?.[entry.id ?? ""]?.[day];
    if (buffered !== undefined) return buffered;
    return entry.hours[day] !== undefined ? String(entry.hours[day]) : "";
  };

  return (
    <>
      {billCodes.map((billCode) => (
        <Fragment key={billCode.id}>
          {/* Desktop / wide screens: keep table-row semantics for larger viewports */}
          <tr className="hidden md:table-row bg-white border-b border-slate-200">
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

            {days.map((day) => (
              <td
                key={day}
                className="p-3 text-center border-r border-slate-200"
              >
                <div className="w-20 mx-auto">
                  <Input
                    id={`${entry.id}-${day}-hours`}
                    pattern="[0-9]*"
                    type="number"
                    min={0}
                    hideSteppers
                    data-invalid={false}
                    value={getInputValue(day)}
                    onChange={(e) =>
                      onTempChange(entry.id ?? "", day, e.currentTarget.value)
                    }
                    onBlur={() => onCommit(entry.id ?? "", day)}
                  />
                </div>
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

          {/* Mobile / narrow screens: modern card layout rendered in a single td to keep table semantics valid */}
          <tr className="md:hidden bg-white border-b border-slate-200">
            <td colSpan={8} className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#0f62fe] truncate">
                      {billCode.bill_code}
                    </div>
                    <div className="text-slate-600 text-sm mt-1 truncate">
                      {billCode.bill_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-slate-700">
                      {calculateTotal(entry.hours)}
                    </div>
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
                  </div>
                </div>

                <div>
                  {days.map((day) => {
                    const mobileId = `${entry.id}-${day}-hours-mobile`;
                    return (
                      <div
                        key={day}
                        className="flex flex-col items-stretch min-w-0"
                      >
                        <label
                          htmlFor={mobileId}
                          className="text-xs text-slate-500 uppercase tracking-wider mb-1 text-left"
                        >
                          {day}
                        </label>
                        <Input
                          id={mobileId}
                          className="w-full"
                          pattern="[0-9]*"
                          type="number"
                          min={0}
                          hideSteppers
                          data-invalid={false}
                          value={getInputValue(day)}
                          onChange={(e) =>
                            onTempChange(
                              entry.id ?? "",
                              day,
                              e.currentTarget.value,
                            )
                          }
                          onBlur={() => onCommit(entry.id ?? "", day)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </td>
          </tr>
        </Fragment>
      ))}
    </>
  );
}
