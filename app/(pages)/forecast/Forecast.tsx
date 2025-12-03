"use client";

import { useState } from "react";
import {
  AddEntryModal,
  ForecastEntriesList,
  ForecastHeader,
  ForecastSummary,
  ForecastTimeline,
  Loading,
  Notifications,
} from "@/app/components";
import type { NewForecastEntry } from "@/app/components/Forecast/AddEntryModal";
import { useForecastData } from "@/app/hooks";
import type { Category, ForecastProps } from "@/types/forecast.types";

type ForecastPageExtendedProps = ForecastProps & {
  categories: Category[];
};

export default function ForecastPage({
  weekEndings,
  categories,
}: ForecastPageExtendedProps) {
  const [forecastStatus, setForecastStatus] = useState<string>("Draft");
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { forecastEntries, isLoading, setForecastEntries } =
    useForecastData(setForecastStatus);

  const handleSave = async () => {
    console.log("Saving forecast...", forecastEntries);
  };

  const handleSubmit = async () => {
    console.log("Submitting forecast...", forecastEntries);
  };

  const handleAddEntry = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveNewEntry = async (entry: NewForecastEntry) => {
    // TODO: Call API to save entry
    console.log("Saving new entry:", entry);
    setIsAddModalOpen(false);
  };

  const handleEditEntry = (entryId: number) => {
    console.log("Edit entry", entryId);
  };

  const handleDeleteEntry = (entryId: number) => {
    setForecastEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

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
          weekEndings={weekEndings}
        />

        <div className="mt-8">
          {viewMode === "timeline" ? (
            <ForecastTimeline
              forecastEntries={forecastEntries}
              weekEndings={weekEndings}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          ) : (
            <ForecastEntriesList
              forecastEntries={forecastEntries}
              weekEndings={weekEndings}
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
      />
    </div>
  );
}
