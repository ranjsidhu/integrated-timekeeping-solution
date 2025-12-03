"use client";

import { useState } from "react";
import { Modal } from "@/app/components";
import type { Category } from "@/types/forecast.types";
import AddEntryStep1 from "./AddEntrySteps/AddEntryStep1";
import AddEntryStep2 from "./AddEntrySteps/AddEntryStep2";

type AddEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: NewForecastEntry) => void;
  categories: Category[];
};

export type NewForecastEntry = {
  category_id: number;
  project_id: number;
  from_date: Date[];
  to_date: Date[];
  hours_per_week: number;
  potential_extension?: Date[];
};

export default function AddEntryModal({
  isOpen,
  onClose,
  onSave,
  categories,
}: AddEntryModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<NewForecastEntry>>({});

  const handleStep1Complete = (data: { category_id: number }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: Omit<NewForecastEntry, "category_id">) => {
    const completeEntry: NewForecastEntry = {
      ...formData,
      ...data,
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
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1
                  ? "bg-[#0f62fe] text-white"
                  : "bg-[#e0e0e0] text-[#8d8d8d]"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 ${currentStep >= 2 ? "bg-[#0f62fe]" : "bg-[#e0e0e0]"}`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2
                  ? "bg-[#0f62fe] text-white"
                  : "bg-[#e0e0e0] text-[#8d8d8d]"
              }`}
            >
              2
            </div>
          </div>
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
      </div>
    </Modal>
  );
}
