import type {
  ForecastEntry,
  ValidationResult,
  WeeklyValidationError,
} from "@/types/forecast.types";

/**
 * Validates that weekly hours across all entries total exactly 40 hours
 * @param existingEntries - All existing forecast entries
 * @param newWeeklyHours - The weekly hours being added/edited
 * @param weekEndings - All week endings for labels
 * @param editingEntryId - If editing, the ID of the entry being edited (to exclude from totals)
 */
export function validateWeeklyHours(
  existingEntries: ForecastEntry[],
  newWeeklyHours: Record<number, number>,
  weekEndings: Array<{ id: number; label: string }>,
  editingEntryId?: number,
): ValidationResult {
  const errors: WeeklyValidationError[] = [];

  // Calculate current totals for each week (excluding the entry being edited)
  const currentWeekTotals: Record<number, number> = {};

  existingEntries.forEach((entry) => {
    // Skip the entry being edited
    if (editingEntryId && entry.id === editingEntryId) {
      return;
    }

    Object.entries(entry.weekly_hours || {}).forEach(([weekIdStr, hours]) => {
      const weekId = Number(weekIdStr);
      currentWeekTotals[weekId] = (currentWeekTotals[weekId] || 0) + hours;
    });
  });

  // Check each week in the new entry
  Object.entries(newWeeklyHours).forEach(([weekIdStr, newHours]) => {
    const weekId = Number(weekIdStr);
    const currentTotal = currentWeekTotals[weekId] || 0;
    const finalTotal = currentTotal + newHours;

    // Only validate weeks that have hours
    if (newHours > 0 && finalTotal !== 40) {
      const week = weekEndings.find((w) => w.id === weekId);
      errors.push({
        weekId,
        weekLabel: week?.label || `Week ${weekId}`,
        currentTotal,
        newHours,
        finalTotal,
      });
    }
  });

  // Also check if any existing week totals will be broken (weeks with hours but now < 40)
  Object.entries(currentWeekTotals).forEach(([weekIdStr, currentTotal]) => {
    const weekId = Number(weekIdStr);

    // If this week isn't in the new entry, check if existing total is exactly 40
    if (!newWeeklyHours[weekId] && currentTotal > 0 && currentTotal !== 40) {
      const week = weekEndings.find((w) => w.id === weekId);
      errors.push({
        weekId,
        weekLabel: week?.label || `Week ${weekId}`,
        currentTotal,
        newHours: 0,
        finalTotal: currentTotal,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors into a user-friendly message
 */
export function formatValidationErrors(
  errors: WeeklyValidationError[],
): string {
  if (errors.length === 0) return "";

  const messages = errors.map((error) => {
    if (error.finalTotal > 40) {
      return `${error.weekLabel}: Total would be ${error.finalTotal}h (over by ${error.finalTotal - 40}h)`;
    } else {
      return `${error.weekLabel}: Total would be ${error.finalTotal}h (under by ${40 - error.finalTotal}h)`;
    }
  });

  return `Weekly hours must total exactly 40h:\n${messages.join("\n")}`;
}
