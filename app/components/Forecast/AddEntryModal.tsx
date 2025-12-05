"use client";

import { useState } from "react";
import { Modal, ProgressIndicator, ProgressStep } from "@/app/components";
import type { Category } from "@/types/forecast.types";
import type { WeekEnding } from "@/types/timesheet.types";
import AddEntryStep1 from "./AddEntrySteps/AddEntryStep1";
import AddEntryStep2 from "./AddEntrySteps/AddEntryStep2";
import AddEntryStep3 from "./AddEntrySteps/AddEntryStep3";

type AddEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: NewForecastEntry) => void;
  categories: Category[];
  weekEndings: WeekEnding[];
};

export type NewForecastEntry = {
  category_id: number;
  project_id: number;
  from_date: Date[];
  to_date: Date[];
  hours_per_week: number;
  potential_extension?: Date[];
  weekly_hours?: Record<number, number>;
};

export default function AddEntryModal({
  isOpen,
  onClose,
  onSave,
  categories,
  weekEndings,
}: AddEntryModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<NewForecastEntry>>({});

  const handleStep1Complete = (data: { category_id: number }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (
    data: Omit<NewForecastEntry, "category_id" | "weekly_hours">,
  ) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3Complete = (weeklyHours: Record<number, number>) => {
    const completeEntry: NewForecastEntry = {
      ...formData,
      weekly_hours: weeklyHours,
    } as NewForecastEntry;

    onSave(completeEntry);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({});
    onClose();
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading="Add Forecast Entry"
      passiveModal
      size="lg"
      preventCloseOnClickOutside
    >
      <div className="p-4">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <ProgressIndicator currentIndex={currentStep - 1}>
            <ProgressStep
              complete={currentStep > 1}
              label="Category"
              description="Select category"
            />
            <ProgressStep
              complete={currentStep > 2}
              label="Details"
              description="Enter details"
            />
            <ProgressStep
              complete={currentStep > 3}
              label="Hours"
              description="Customize hours"
            />
          </ProgressIndicator>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <AddEntryStep1
            categories={categories}
            onNext={handleStep1Complete}
            onCancel={handleClose}
          />
        )}

        {currentStep === 2 && (
          <AddEntryStep2
            categoryId={formData.category_id}
            onNext={handleStep2Complete}
            onBack={handleBack}
            onCancel={handleClose}
          />
        )}

        {currentStep === 3 && (
          <AddEntryStep3
            fromDate={formData.from_date || []}
            toDate={formData.to_date || []}
            weekEndings={weekEndings}
            onNext={handleStep3Complete}
            onBack={handleBack}
            onCancel={handleClose}
          />
        )}
      </div>
    </Modal>
  );
}
