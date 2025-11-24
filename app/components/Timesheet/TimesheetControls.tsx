"use client";

import { Add } from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import type { WeekEnding } from "@/types/timesheet.types";
import Button from "../Button/Button";
import Column from "../Column/Column";
import Dropdown from "../Dropdown/Dropdown";

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
  const router = useRouter();

  return (
    <div className="bg-white p-6 border-b border-slate-200 flex flex-col justify-center">
      <Column lg={4} md={4} sm={4} className="mb-4">
        <Dropdown
          id="week-ending"
          titleText="Week ending"
          label={selectedWeek?.label}
          items={weekEndings}
          className="w-40"
          itemToString={(item) => (item ? item.label : "")}
          onChange={({ selectedItem }) => {
            if (selectedItem) setSelectedWeek(selectedItem);
          }}
          size="lg"
        />
      </Column>

      <Column lg={12} md={4} sm={4}>
        <div className="flex gap-3 flex-wrap items-end">
          <Button
            kind="primary"
            renderIcon={Add}
            size="md"
            onClick={() => router.push("/search")}
          >
            <span className="button-text">Add bill code</span>
          </Button>

          <Button kind="tertiary" size="md" className="whitespace-nowrap">
            <span className="button-text-short">Copy prev week</span>
          </Button>
        </div>
      </Column>
    </div>
  );
}
