import type { TimesheetActionsProps } from "@/types/timesheet.types";
import Button from "../Button/Button";

export default function TimesheetActions({
  handleSave,
  handleSubmit,
}: TimesheetActionsProps) {
  return (
    <div className="flex gap-4 p-6 border-t border-slate-200 bg-white flex-wrap">
      <Button
        kind="secondary"
        size="lg"
        onClick={handleSave}
        className="flex-1 min-w-[120px]"
      >
        Save
      </Button>

      <Button
        kind="primary"
        size="lg"
        onClick={handleSubmit}
        className="flex-1 min-w-[120px]"
      >
        Submit
      </Button>
    </div>
  );
}
