/**
 * Timesheet Type Definitions
 */

export interface WeekEnding {
  id: number;
  label: string;
  week_ending: Date;
  status: string;
}

export interface BillCode {
  id: number;
  code: string;
  description: string;
  projectName?: string;
  clientName?: string;
  workItems?: WorkItem[];
  isExpanded?: boolean;
}

export interface WorkItem {
  id: number;
  codeId: number;
  workItemCode: string;
  description: string;
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
  billCodeId: number;
  subCodeId?: number;
  hours: DayHours;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Timesheet {
  id: number;
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
  id: number;
  name: string;
  description?: string;
  entries: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">[];
  isDefault?: boolean;
}

export interface TimesheetProps {
  weekEndings: WeekEnding[];
}

export interface Code {
  id: number;
  project_id: number | null;
  code: string;
  description: string;
  is_system_code: boolean;
  start_date: Date;
  expiry_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SearchCodeResultProps {
  code: Code;
}
