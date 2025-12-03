"use client";

import { useEffect, useState } from "react";
import { Modal, ProgressIndicator, ProgressStep } from "@/app/components";
import type { Category, ForecastEntry } from "@/types/forecast.types";
import type { NewForecastEntry } from "./AddEntryModal";
import AddEntryStep1 from "./AddEntrySteps/AddEntryStep1";
import AddEntryStep2 from "./AddEntrySteps/AddEntryStep2";

type EditEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entryId: number, entry: NewForecastEntry) => void;
  categories: Category[];
  entry: ForecastEntry | null;
};

export default function EditEntryModal({
  isOpen,
  onClose,
  onSave,
  categories,
  entry,
}: EditEntryModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<NewForecastEntry>>({});

  // Initialize form with existing entry data
  useEffect(() => {
    if (entry) {
      setFormData({
        category_id: entry.category_id,
        project_id: entry.project_id,
        from_date: [new Date(entry.from_date)],
        to_date: [new Date(entry.to_date)],
        hours_per_week: entry.hours_per_week,
        potential_extension: entry.potential_extension
          ? [new Date(entry.potential_extension)]
          : undefined,
      });
    }
  }, [entry]);

  const handleStep1Complete = (data: { category_id: number }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: Omit<NewForecastEntry, "category_id">) => {
    const completeEntry: NewForecastEntry = {
      ...formData,
      ...data,
    } as NewForecastEntry;

    if (entry) {
      onSave(entry.id, completeEntry);
    }
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
      modalHeading="Edit Forecast Entry"
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
          </ProgressIndicator>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <AddEntryStep1
            categories={categories}
            onNext={handleStep1Complete}
            onCancel={handleClose}
            initialCategoryId={formData.category_id}
          />
        )}

        {currentStep === 2 && (
          <AddEntryStep2
            categoryId={formData.category_id}
            onNext={handleStep2Complete}
            onBack={handleBack}
            onCancel={handleClose}
            initialData={{
              project_id: formData.project_id,
              from_date: formData.from_date,
              to_date: formData.to_date,
              hours_per_week: formData.hours_per_week,
              potential_extension: formData.potential_extension,
            }}
          />
        )}
      </div>
    </Modal>
  );
}
