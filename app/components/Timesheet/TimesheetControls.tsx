import { Add } from "@carbon/icons-react";
import type { WeekEnding } from "@/types/timesheet.types";
import Button from "../Button/Button";
import Column from "../Column/Column";
import Dropdown from "../Dropdown/Dropdown";
import Grid from "../Grid/Grid";

type TimesheetControlsProps = {
  selectedWeek: WeekEnding;
  weekEndings: WeekEnding[];
  setSelectedWeek: React.Dispatch<React.SetStateAction<WeekEnding>>;
};

export default function TimesheetControls({
  selectedWeek,
  setSelectedWeek,
  weekEndings,
}: TimesheetControlsProps) {
  return (
    <div className="bg-white p-6 border-b border-slate-200 flex items-center">
      <Grid narrow>
        <Column lg={4} md={4} sm={4} className="mb-4">
          <Dropdown
            id="week-ending"
            titleText="Week ending"
            label={selectedWeek?.label}
            items={weekEndings}
            itemToString={(item) => (item ? item.label : "")}
            onChange={({ selectedItem }) => {
              if (selectedItem) setSelectedWeek(selectedItem);
            }}
            size="lg"
          />
        </Column>

        <Column lg={12} md={4} sm={4}>
          <div className="flex gap-3 flex-wrap items-end">
            <Button kind="primary" renderIcon={Add} size="md">
              <span className="button-text">Add bill code</span>
            </Button>

            <Button kind="tertiary" size="md" className="whitespace-nowrap">
              <span className="button-text-short">Copy template</span>
            </Button>

            <Button kind="tertiary" size="md" className="whitespace-nowrap">
              <span className="button-text-short">Copy prev week</span>
            </Button>
          </div>
        </Column>
      </Grid>
    </div>
  );
}
