"use client";

import { useState } from "react";
import {
  createForecastEntry,
  deleteForecastEntry,
  getForecastPlan,
  saveForecastPlan,
  submitForecastPlan,
  updateForecastEntry,
} from "@/app/actions";
import {
  AddEntryModal,
  EditEntryModal,
  ForecastEntriesList,
  ForecastHeader,
  ForecastSummary,
  ForecastTimeline,
  Loading,
  Notifications,
} from "@/app/components";

import { useForecastData } from "@/app/hooks";
import { useNotification } from "@/app/providers";
import type {
  ForecastEntry,
  ForecastPageExtendedProps,
  NewForecastEntry,
} from "@/types/forecast.types";
import { formatValidationErrors } from "@/utils/forecast/validation.utils";

export default function ForecastPage({
  weekEndings,
  categories,
}: ForecastPageExtendedProps) {
  const [forecastStatus, setForecastStatus] = useState<string>("Draft");
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ForecastEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [problemWeeks, setProblemWeeks] = useState<number[]>([]);

  const { forecastEntries, isLoading, setForecastEntries } =
    useForecastData(setForecastStatus);

  const { addNotification } = useNotification();

  const handleSave = async () => {
    setProblemWeeks([]);
    const result = await saveForecastPlan();

    if (result.success) {
      addNotification({
        kind: "success",
        type: "inline",
        title: "Forecast saved",
        subtitle: "Your changes have been saved successfully",
      });
      setForecastStatus("Draft");
    } else {
      addNotification({
        kind: "error",
        type: "inline",
        title: "Error saving forecast",
        subtitle: result.error || "Failed to save forecast",
      });
    }
  };

  const handleSubmit = async () => {
    setProblemWeeks([]);
    const result = await submitForecastPlan();

    if (result.success) {
      setForecastStatus(result.status || "Submitted");
      addNotification({
        kind: "success",
        type: "inline",
        title: "Forecast submitted",
        subtitle: "Your forecast has been submitted successfully",
      });
    } else if (result.validationErrors && result.validationErrors.length > 0) {
      // Track problematic weeks for highlighting in the timeline
      setProblemWeeks(result.validationErrors.map((e) => e.weekId));
      const formatted = formatValidationErrors(
        result.validationErrors.map((err) => ({
          weekId: err.weekId,
          weekLabel: new Date(err.weekEnding).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          currentTotal: err.total,
          newHours: 0,
          finalTotal: err.total,
        })),
      );

      const [summary, ...lines] = formatted.split("\n");

      addNotification({
        kind: "error",
        type: "inline",
        title: "Cannot submit forecast",
        subtitle: summary,
      });

      lines.forEach((line) => {
        if (line.trim().length === 0) return;
        addNotification({
          kind: "error",
          type: "inline",
          title: "",
          subtitle: line,
        });
      });
    } else {
      // Clear any previous highlights on generic error or success handled above
      setProblemWeeks([]);
      addNotification({
        kind: "error",
        type: "inline",
        title: "Error submitting forecast",
        subtitle: result.error || "Failed to submit forecast",
      });
    }
  };

  const handleAddEntry = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveNewEntry = async (entry: NewForecastEntry) => {
    const result = await createForecastEntry(entry);

    if (result.success) {
      // Reload forecast data
      const forecastResult = await getForecastPlan();
      if (forecastResult.success) {
        setForecastEntries(forecastResult.entries || []);
      }

      setIsAddModalOpen(false);
      addNotification({
        kind: "success",
        type: "inline",
        title: "Entry created",
        subtitle: "Your forecast entry has been created successfully",
      });
    } else {
      addNotification({
        kind: "error",
        type: "inline",
        title: "Error creating entry",
        subtitle: result.error || "Failed to create entry",
      });
    }
  };

  const handleEditEntry = (entryId: number) => {
    const entry = forecastEntries.find((e) => e.id === entryId);
    if (entry) {
      setEditingEntry(entry);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateEntry = async (
    entryId: number,
    entry: NewForecastEntry,
  ) => {
    const result = await updateForecastEntry(entryId, entry);

    if (result.success) {
      // Reload forecast data
      const forecastResult = await getForecastPlan();
      if (forecastResult.success) {
        setForecastEntries(forecastResult.entries || []);
      }

      setIsEditModalOpen(false);
      setEditingEntry(null);
      addNotification({
        kind: "success",
        type: "inline",
        title: "Entry updated",
        subtitle: "Your forecast entry has been updated successfully",
      });
    } else {
      addNotification({
        kind: "error",
        type: "inline",
        title: "Error updating entry",
        subtitle: result.error || "Failed to update entry",
      });
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    const result = await deleteForecastEntry(entryId);

    if (result.success) {
      setForecastEntries((prev) => prev.filter((e) => e.id !== entryId));
      addNotification({
        kind: "success",
        type: "inline",
        title: "Entry deleted",
        subtitle: "Your forecast entry has been deleted successfully",
      });
    } else {
      addNotification({
        kind: "error",
        type: "inline",
        title: "Error deleting entry",
        subtitle: result.error || "Failed to delete entry",
      });
    }
  };

  const displayWeeks = weekEndings.slice(0, 12);

  return (
    <div className="w-full bg-[#f4f4f4] min-h-screen">
      <Loading active={isLoading} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForecastHeader
          status={forecastStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddEntry={handleAddEntry}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />

        <Notifications />

        <ForecastSummary
          forecastEntries={forecastEntries}
          weekEndings={displayWeeks}
        />

        <div className="mt-8">
          {viewMode === "timeline" ? (
            <ForecastTimeline
              forecastEntries={forecastEntries}
              weekEndings={displayWeeks}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              problemWeeks={problemWeeks}
            />
          ) : (
            <ForecastEntriesList
              forecastEntries={forecastEntries}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewEntry}
        categories={categories}
        weekEndings={weekEndings}
        existingEntries={forecastEntries}
      />

      <EditEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleUpdateEntry}
        categories={categories}
        entry={editingEntry}
        weekEndings={weekEndings}
        existingEntries={forecastEntries}
      />
    </div>
  );
}
