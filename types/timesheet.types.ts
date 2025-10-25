/**
 * Timesheet Type Definitions
 */

export interface WeekEnding {
  id: string;
  label: string;
  date: Date;
  status?: "draft" | "saved" | "submitted" | "approved" | "rejected";
}

export interface BillCode {
  id: string;
  code: string;
  description: string;
  projectName?: string;
  clientName?: string;
  subCodes?: SubCode[];
  isExpanded?: boolean;
}

export interface SubCode {
  id: string;
  code: string;
  description: string;
  category?: string;
}

export interface DayHours {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat?: number;
  sun?: number;
}

export interface TimeEntry {
  id?: string;
  billCodeId: string;
  subCodeId?: string;
  hours: DayHours;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Timesheet {
  id: string;
  userId: string;
  weekEnding: Date;
  entries: TimeEntry[];
  status: "draft" | "saved" | "submitted" | "approved" | "rejected";
  totalHours: number;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  comments?: string[];
}

export interface TimesheetSummary {
  weekEnding: Date;
  totalHours: number;
  status: Timesheet["status"];
  billCodes: string[];
}

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TimesheetValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings: {
    field: string;
    message: string;
  }[];
}

export interface TimesheetTemplate {
  id: string;
  name: string;
  description?: string;
  entries: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">[];
  isDefault?: boolean;
}
