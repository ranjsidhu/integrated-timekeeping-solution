import { ChevronDown, ChevronRight } from "@carbon/icons-react";
import type { CodeWithWorkItems } from "@/types/timesheet.types";

type TimesheetWorkItemsProps = {
  workItem: CodeWithWorkItems["work_items"][number];
  isExpanded: boolean;
  toggleExpanded: (id: number) => void;
};

export default function TimesheetWorkItems({
  isExpanded,
  toggleExpanded,
  workItem,
}: TimesheetWorkItemsProps) {
  return (
    <tr
      className="bg-white border-b border-slate-200 cursor-pointer"
      onClick={() => toggleExpanded(workItem.id)}
    >
      <td className="p-4 sticky left-0 bg-white z-10">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown size={20} className="shrink-0" />
          ) : (
            <ChevronRight size={20} className="shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-semibold text-[#0f62fe] overflow-hidden text-ellipsis whitespace-nowrap">
              {workItem.work_item_code}
            </div>
            <div className="text-slate-600 text-[0.8125rem] mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {workItem.description}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
