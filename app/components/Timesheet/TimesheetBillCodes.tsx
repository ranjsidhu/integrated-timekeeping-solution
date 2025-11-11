import { ChevronDown, ChevronRight } from "@carbon/icons-react";
import type { BillCode } from "@/types/timesheet.types";

type TimesheetBillCodesProps = {
  billCode: BillCode;
  toggleExpanded: (id: string) => void;
  isExpanded: boolean;
};

export default function TimesheetBillCodes({
  billCode,
  isExpanded,
  toggleExpanded,
}: TimesheetBillCodesProps) {
  return (
    <tr
      className="bg-white border-b border-slate-200 cursor-pointer"
      onClick={() => toggleExpanded(billCode.id)}
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
              {billCode.code}
            </div>
            <div className="text-slate-600 text-[0.8125rem] mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {billCode.description}
            </div>
          </div>
        </div>
      </td>
      <td colSpan={7}></td>
    </tr>
  );
}
