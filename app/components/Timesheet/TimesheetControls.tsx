"use client";

import { Add } from "@carbon/icons-react";
import { Popover, PopoverContent } from "@carbon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  TimesheetControlsProps,
  WeekEnding,
} from "@/types/timesheet.types";
import Button from "../Button/Button";
import Column from "../Column/Column";
import Dropdown from "../Dropdown/Dropdown";

export default function TimesheetControls({
  selectedWeek,
  setSelectedWeek,
  weekEndings,
  onCopyWeek,
}: TimesheetControlsProps) {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Get only previous weeks (before selected week)
  const previousWeeks = weekEndings.filter(
    (week) => new Date(week.week_ending) < new Date(selectedWeek.week_ending),
  );

  const handleCopyWeek = (weekToCopy: WeekEnding) => {
    onCopyWeek?.(weekToCopy);
  };

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

          <Popover
            open={isPopoverOpen}
            onRequestClose={() => setIsPopoverOpen(false)}
            align="bottom-left"
          >
            <Button
              kind="tertiary"
              size="md"
              className="whitespace-nowrap"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              disabled={previousWeeks.length === 0}
            >
              <span className="button-text-short">Copy previous week</span>
            </Button>

            <PopoverContent className="p-0">
              <div className="bg-white border border-slate-200 rounded shadow-lg max-h-64 overflow-y-auto">
                <div className="p-2 border-b border-slate-200 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600 uppercase">
                    Select week to copy from
                  </p>
                </div>
                <div className="py-1">
                  {previousWeeks.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No previous weeks available
                    </div>
                  ) : (
                    previousWeeks.map((week) => (
                      <button
                        key={week.id}
                        type="button"
                        onClick={() => {
                          handleCopyWeek(week);
                          setIsPopoverOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition-colors flex items-center justify-between gap-2"
                      >
                        <span>{week.label}</span>
                        <span className="text-xs text-slate-500">
                          {week.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Column>
    </div>
  );
}
