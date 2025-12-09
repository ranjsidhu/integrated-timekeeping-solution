"use client";

import { useEffect, useState } from "react";
import {
  AddEntryStep1,
  AddEntryStep2,
  AddEntryStep3,
  Modal,
  ProgressIndicator,
  ProgressStep,
} from "@/app/components";
import type {
  EditEntryModalProps,
  NewForecastEntry,
} from "@/types/forecast.types";

export default function EditEntryModal({
  isOpen,
  onClose,
  onSave,
  categories,
  weekEndings,
  entry,
  existingEntries,
}: EditEntryModalProps) {
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState<Partial<NewForecastEntry>>({});
  const [currentHoursPerWeek, setCurrentHoursPerWeek] = useState(40);
  const [hoursPerWeekChanged, setHoursPerWeekChanged] = useState(false);

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
        weekly_hours: entry.weekly_hours,
      });
      setCurrentHoursPerWeek(entry.hours_per_week);
      setHoursPerWeekChanged(false);
    }
  }, [entry]);

  const handleStep1Complete = (data: { category_id: number }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (
    data: Omit<NewForecastEntry, "category_id" | "weekly_hours">,
  ) => {
    setFormData((prev) => ({ ...prev, ...data }));

    // Check if hours per week changed
    if (data.hours_per_week !== currentHoursPerWeek) {
      setHoursPerWeekChanged(true);
    }

    setCurrentHoursPerWeek(data.hours_per_week);
    setCurrentStep(3);
  };

  const handleStep3Complete = (weeklyHours: Record<number, number>) => {
    const completeEntry: NewForecastEntry = {
      ...formData,
      hours_per_week: currentHoursPerWeek,
      weekly_hours: weeklyHours,
    } as NewForecastEntry;

    if (entry) {
      onSave(entry.id, completeEntry);
    }
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(2);
    setFormData({});
    setCurrentHoursPerWeek(40);
    setHoursPerWeekChanged(false);
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
              hours_per_week: currentHoursPerWeek,
              potential_extension: formData.potential_extension,
            }}
          />
        )}

        {currentStep === 3 && formData.from_date && formData.to_date && (
          <AddEntryStep3
            fromDate={formData.from_date}
            toDate={formData.to_date}
            weekEndings={weekEndings}
            existingEntries={existingEntries}
            editingEntryId={entry?.id}
            onNext={handleStep3Complete}
            onBack={handleBack}
            onCancel={handleClose}
            // Only pass initialWeeklyHours if hours per week hasn't changed
            initialWeeklyHours={
              hoursPerWeekChanged ? undefined : formData.weekly_hours
            }
            defaultHoursPerWeek={currentHoursPerWeek}
          />
        )}
      </div>
    </Modal>
  );
}
