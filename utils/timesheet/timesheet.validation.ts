import { prisma } from "@/prisma/prisma";
import type {
  TimeEntry,
  TimesheetValidationError,
} from "@/types/timesheet.types";

/**
 * Validates timesheet entries before submission
 * @param timeEntries - the time entries to validate
 * @param weekEndingDate - the week ending date (Friday)
 * @returns - an object containing validation result and any errors found
 */
export async function validateTimesheetSubmission(
  timeEntries: TimeEntry[],
  weekEndingDate: Date,
) {
  const errors: TimesheetValidationError[] = [];

  // Validation: At least one entry with hours
  const hasAnyHours = timeEntries.some((entry) =>
    Object.values(entry.hours).some((hours) => (hours || 0) > 0),
  );

  if (!hasAnyHours) {
    errors.push({
      message:
        "Timesheet must contain at least one entry with logged hours before submission",
    });
    return {
      isValid: false,
      errors,
    };
  }

  // Get unique bill code IDs from entries that have hours
  const billCodeIds = [
    ...new Set(
      timeEntries
        .filter((e) => Object.values(e.hours).some((h) => (h || 0) > 0))
        .map((e) => e.billCodeId),
    ),
  ];

  if (billCodeIds.length === 0) {
    return {
      isValid: true,
      errors: [],
    };
  }

  // Fetch all bill codes with their work items and codes and projects
  const billCodes = await prisma.billCode.findMany({
    where: {
      id: {
        in: billCodeIds,
      },
    },
    include: {
      work_item: {
        include: {
          code: {
            include: {
              project: true,
            },
          },
        },
      },
    },
  });

  // Calculate Monday from week ending (Friday)
  const monday = new Date(weekEndingDate);
  monday.setDate(weekEndingDate.getDate() - 4);
  const friday = new Date(weekEndingDate);

  // Check each bill code and its corresponding entries
  for (const billCode of billCodes) {
    const code = billCode.work_item.code;
    const entries = timeEntries.filter((e) => e.billCodeId === billCode.id);

    // Validation: Active projects - if code belongs to a project, it must be active
    if (code.project_id && code.project && !code.project.is_active) {
      errors.push({
        billCodeId: billCode.id,
        message: `Project "${code.project.project_name}" for bill code "${code.code}" is no longer active and cannot be used for new timesheet entries`,
      });
    }

    // Check each day's entries for this bill code
    const daysOfWeek = ["mon", "tue", "wed", "thu", "fri"] as const;
    const dayIndexMap: Record<string, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
    };

    // Validation: Check for duplicate entries (same bill code on same work date)
    const workDateCounts = new Map<string, number>();
    for (const day of daysOfWeek) {
      const hours = entries[0]?.hours[day] || 0;
      if (hours > 0) {
        const workDate = new Date(monday);
        workDate.setDate(monday.getDate() + dayIndexMap[day]);
        const dateKey = workDate.toISOString().split("T")[0];
        workDateCounts.set(dateKey, (workDateCounts.get(dateKey) || 0) + 1);
      }
    }

    for (const [dateKey, count] of workDateCounts) {
      if (count > 1) {
        errors.push({
          billCodeId: billCode.id,
          message: `Bill code "${code.code}" (${billCode.bill_name}) has multiple entries on ${new Date(dateKey).toLocaleDateString()} which is not allowed`,
        });
      }
    }

    // Check dates for each day with hours
    for (const day of daysOfWeek) {
      const hours = entries[0]?.hours[day] || 0;

      if (hours > 0) {
        const workDate = new Date(monday);
        workDate.setDate(monday.getDate() + dayIndexMap[day]);

        // Validation: Work date range - dates must be within the week
        if (workDate < monday || workDate > friday) {
          errors.push({
            billCodeId: billCode.id,
            workDate,
            message: `Work date ${workDate.toLocaleDateString()} for bill code "${code.code}" falls outside the current week`,
          });
        }

        // Validation: Start date check - entries can't be before code's start date
        const startDate = new Date(code.start_date);
        if (workDate < startDate) {
          errors.push({
            billCodeId: billCode.id,
            workDate,
            message: `Bill code "${code.code}" cannot be used before ${startDate.toLocaleDateString()} (start date)`,
          });
        }

        // Validation: Expiry date check - entries can't be after code's expiry date
        const expiryDate = new Date(code.expiry_date);
        if (workDate > expiryDate) {
          errors.push({
            billCodeId: billCode.id,
            workDate,
            message: `Bill code "${code.code}" has expired as of ${expiryDate.toLocaleDateString()}`,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
