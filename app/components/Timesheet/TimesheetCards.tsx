import { ChevronDown, ChevronRight, TrashCan } from "@carbon/icons-react";
import type {
  CodeWithWorkItems,
  DayOfWeek,
  TimeEntry,
} from "@/types/timesheet.types";
import { calculateTotal } from "@/utils/timesheet/timesheet.utils";
import Input from "../Input/Input";

type TimesheetCardsProps = {
  workItems: CodeWithWorkItems["work_items"];
  expandedRows: Set<string>;
  toggleExpanded: (id: number) => void;
  editingValues?: Record<string, Partial<Record<DayOfWeek, string>>>;
  onTempChange: (entryId: string, day: DayOfWeek, value: string) => void;
  onCommit: (entryId: string, day: DayOfWeek) => void;
  deleteEntry: (entryId: string) => void;
  timeEntries: TimeEntry[];
};

const days: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri"];

export default function TimesheetCards({
  workItems,
  expandedRows,
  toggleExpanded,
  editingValues,
  onTempChange,
  onCommit,
  deleteEntry,
  timeEntries,
}: TimesheetCardsProps) {
  const getInputValue = (entryId: string | undefined, day: DayOfWeek) => {
    if (!entryId) return "";
    const buffered = editingValues?.[entryId]?.[day];
    if (buffered !== undefined) return buffered;
    const entry = timeEntries.find((e) => e.id === entryId);
    return entry?.hours?.[day] !== undefined ? String(entry.hours[day]) : "";
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {workItems.map((wi) => {
        const isExpanded = expandedRows.has(wi.id.toString());
        const entry = timeEntries.find((e) => e.subCodeId === wi.id);
        const entryId = entry?.id ?? `entry-${wi.id}`;

        return (
          <div
            key={wi.id}
            className="bg-white shadow-sm rounded-md overflow-hidden"
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => toggleExpanded(wi.id)}
              className="w-full text-left flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[#0f62fe] truncate">
                    {wi.work_item_code}
                  </div>
                  <div className="text-slate-600 text-sm mt-1 truncate">
                    {wi.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-slate-700">
                  {calculateTotal(
                    entry?.hours ?? { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 },
                  )}
                </div>
                <TrashCan
                  data-testid="delete-entry-button"
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    entry?.id && deleteEntry(entry.id);
                  }}
                />
              </div>
            </button>

            {isExpanded && wi.bill_codes && (
              <div className="border-t border-slate-100 p-4">
                <div className="w-full">
                  {wi.bill_codes.map((bc) => (
                    <div key={bc.id} className="p-4 bg-slate-50 rounded-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-[#0f62fe] truncate">
                            {bc.bill_code}
                          </div>
                          <div className="text-slate-600 text-sm mt-1 truncate">
                            {bc.bill_name}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-700">
                          {calculateTotal(
                            entry?.hours ?? {
                              mon: 0,
                              tue: 0,
                              wed: 0,
                              thu: 0,
                              fri: 0,
                            },
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                        {days.map((day) => (
                          <div
                            key={day}
                            className="flex flex-col items-stretch min-w-0"
                          >
                            <label
                              htmlFor={`${entryId}-${day}-card`}
                              className="text-xs text-slate-500 mb-1 text-left"
                            >
                              {day.toUpperCase()}
                            </label>
                            <Input
                              id={`${entryId}-${day}-card`}
                              className="w-full"
                              pattern="[0-9]*"
                              type="number"
                              min={0}
                              hideSteppers
                              data-invalid={false}
                              value={getInputValue(entryId, day)}
                              onChange={(e) =>
                                onTempChange(
                                  entryId,
                                  day,
                                  e.currentTarget.value,
                                )
                              }
                              onBlur={() => onCommit(entryId, day)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
