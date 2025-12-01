"use client";

import { Add } from "@carbon/icons-react";
import Button from "../Button/Button";
import Column from "../Column/Column";

type ForecastControlsProps = {
  onAddEntry: () => void;
};

export default function ForecastControls({
  onAddEntry,
}: ForecastControlsProps) {
  return (
    <div className="bg-white p-6 border-b border-slate-200">
      <Column lg={12} md={4} sm={4}>
        <div className="flex gap-3 flex-wrap items-end">
          <Button
            kind="primary"
            renderIcon={Add}
            size="md"
            onClick={onAddEntry}
          >
            <span className="button-text">Add</span>
          </Button>
        </div>
      </Column>
    </div>
  );
}
