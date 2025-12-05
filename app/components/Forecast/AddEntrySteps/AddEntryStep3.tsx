"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddEntryStep3Props } from "@/types/forecast.types";
import type { WeekEnding } from "@/types/timesheet.types";
import Button from "../../Button/Button";
import Input from "../../Input/Input";

export default function AddEntryStep3({
  fromDate,
  toDate,
  weekEndings,
  existingEntries,
  editingEntryId,
  onNext,
  onBack,
  onCancel,
  initialWeeklyHours,
  defaultHoursPerWeek = 40,
}: AddEntryStep3Props) {
  const [weeklyHours, setWeeklyHours] = useState<Record<number, number>>({});

  const from = useMemo(
    () => (Array.isArray(fromDate) ? fromDate[0] : fromDate),
    [fromDate],
  );
  const to = useMemo(
    () => (Array.isArray(toDate) ? toDate[0] : toDate),
    [toDate],
  );

  // Calculate which weeks fall within the date range (memoized)
  const relevantWeeks = useMemo(() => {
    return weekEndings.filter((week) => {
      const weekEnd = new Date(week.week_ending);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      return to >= weekStart && from <= weekEnd;
    });
  }, [weekEndings, from, to]);

  // Calculate working days for a week (memoized callback)
  const getWorkingDaysInWeek = useCallback(
    (week: WeekEnding) => {
      const weekEnd = new Date(week.week_ending);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const actualStart = from > weekStart ? from : weekStart;
      const actualEnd = to < weekEnd ? to : weekEnd;

      let days = 0;
      const current = new Date(actualStart);

      while (current <= actualEnd) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days++;
        }
        current.setDate(current.getDate() + 1);
      }

      return days;
    },
    [from, to],
  );

  const calculateSuggestedHours = useCallback(
    (week: WeekEnding) => {
      const workingDaysInWeek = getWorkingDaysInWeek(week);
      // Proportion of the week worked (out of 5 working days)
      const proportion = workingDaysInWeek / 5;
      // Apply proportion to the defaultHoursPerWeek
      return Math.round(defaultHoursPerWeek * proportion);
    },
    [getWorkingDaysInWeek, defaultHoursPerWeek],
  );

  // Calculate current week totals (excluding editing entry)
  const currentWeekTotals = useMemo(() => {
    const totals: Record<number, number> = {};

    existingEntries.forEach((entry) => {
      if (editingEntryId && entry.id === editingEntryId) {
        return;
      }

      Object.entries(entry.weekly_hours || {}).forEach(([weekIdStr, hours]) => {
        const weekId = Number(weekIdStr);
        totals[weekId] = (totals[weekId] || 0) + hours;
      });
    });

    return totals;
  }, [existingEntries, editingEntryId]);

  // Initialize weekly hours with suggested hours

  useEffect(() => {
    if (initialWeeklyHours && Object.keys(initialWeeklyHours).length > 0) {
      // When editing, merge initial hours with new weeks
      const initial: Record<number, number> = { ...initialWeeklyHours };

      // For any NEW weeks not in initialWeeklyHours, calculate suggested hours
      relevantWeeks.forEach((week) => {
        if (!(week.id in initial)) {
          const suggestedHours = calculateSuggestedHours(week);
          initial[week.id] = suggestedHours;
        }
      });

      setWeeklyHours(initial);
    } else if (relevantWeeks.length > 0) {
      const initial: Record<number, number> = {};
      relevantWeeks.forEach((week) => {
        const suggestedHours = calculateSuggestedHours(week);
        initial[week.id] = suggestedHours;
      });
      setWeeklyHours(initial);
    }
  }, [relevantWeeks, calculateSuggestedHours, initialWeeklyHours]);

  const handleHoursChange = (weekId: number, hours: string) => {
    const numHours = Math.max(0, Math.min(40, Number(hours) || 0));
    setWeeklyHours((prev) => ({
      ...prev,
      [weekId]: numHours,
    }));
  };

  const handleNext = () => {
    onNext(weeklyHours);
  };

  const totalHours = Object.values(weeklyHours).reduce((sum, h) => sum + h, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#161616] mb-2">
          Customize Weekly Hours
        </h3>
        <p className="text-sm text-[#525252] mb-4">
          Hours are pre-filled based on working days in each week (proportional
          to {defaultHoursPerWeek}h/week). You can adjust as needed. Final
          validation will occur when you submit your forecast plan.
        </p>
      </div>

      {/* Weekly Hours Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {relevantWeeks.map((week, index) => {
          const workingDays = getWorkingDaysInWeek(week);
          const currentTotal = currentWeekTotals[week.id] || 0;
          const remaining = 40 - currentTotal;

          return (
            <div
              key={week.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-[#f4f4f4]"
            >
              <div className="flex-1">
                <div className="font-medium text-[#161616]">
                  Week {index + 1}
                </div>
                <div className="text-sm text-[#525252]">
                  {new Date(week.week_ending).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-xs text-[#8d8d8d] mt-1">
                  {workingDays} working day{workingDays !== 1 ? "s" : ""} •{" "}
                  {currentTotal > 0 && (
                    <span>
                      Other entries: {currentTotal}h • Available: {remaining}h
                    </span>
                  )}
                  {currentTotal === 0 && <span>Available: 40h</span>}
                  {workingDays < 5 && (
                    <span>
                      {" "}
                      • Suggested:{" "}
                      {Math.round(defaultHoursPerWeek * (workingDays / 5))}h
                    </span>
                  )}
                </div>
              </div>

              <div className="w-32">
                <Input
                  id={`week-${week.id}`}
                  type="number"
                  min={0}
                  max={40}
                  hideSteppers
                  value={String(weeklyHours[week.id] || 0)}
                  onChange={(e) =>
                    handleHoursChange(week.id, e.currentTarget.value)
                  }
                  label=""
                  className="text-center"
                />
              </div>

              {weeklyHours[week.id] !== remaining &&
                remaining > 0 &&
                remaining <= 40 && (
                  <button
                    type="button"
                    onClick={() =>
                      handleHoursChange(week.id, String(remaining))
                    }
                    className="text-xs text-[#0f62fe] hover:underline whitespace-nowrap ml-4"
                  >
                    Use {remaining}h
                  </button>
                )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="p-4 bg-[#e0e0e0] rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#161616]">
            Total Hours (This Entry)
          </span>
          <span className="text-xl font-semibold text-[#161616]">
            {totalHours}h
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-[#e0e0e0]">
        <Button kind="secondary" size="md" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button kind="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button kind="primary" size="md" onClick={handleNext}>
            {editingEntryId ? "Update Entry" : "Create Entry"}
          </Button>
        </div>
      </div>
    </div>
  );
}
