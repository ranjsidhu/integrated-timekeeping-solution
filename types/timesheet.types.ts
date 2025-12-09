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
  workItems?: WorkItem[];
  isExpanded?: boolean;
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
  code: CodeWithWorkItems;
}

export interface CodeWithWorkItems extends Code {
  work_items: {
    id: number;
    code_id: number;
    work_item_code: string;
    description: string;
    bill_codes: {
      id: number;
      work_item_id: number;
      bill_code: string;
      bill_name: string;
    }[];
  }[];
}

export interface WorkItem {
  id: number;
  code_id: number;
  work_item_code: string;
  description: string;
}

export type TimesheetActionsProps = {
  handleSave: () => void;
  handleSubmit: () => void;
};

export type TimesheetBillCodesProps = {
  billCodes: CodeWithWorkItems["work_items"][number]["bill_codes"];
  editingValues?: Record<string, Partial<Record<DayOfWeek, string>>>;
  onTempChange: (entryId: string, day: DayOfWeek, value: string) => void;
  onCommit: (entryId: string, day: DayOfWeek) => void;
  deleteEntry: (entryId: string) => void;
  entry: TimeEntry;
};

export type TimesheetCardsProps = {
  workItems: CodeWithWorkItems["work_items"];
  expandedRows: Set<string>;
  toggleExpanded: (id: number) => void;
  weekEnd: Date | string;
  editingValues?: Record<string, Partial<Record<DayOfWeek, string>>>;
  onTempChange: (entryId: string, day: DayOfWeek, value: string) => void;
  onCommit: (entryId: string, day: DayOfWeek) => void;
  deleteEntry: (entryId: string) => void;
  timeEntries: TimeEntry[];
};

export type TimesheetControlsProps = {
  selectedWeek: WeekEnding;
  weekEndings: WeekEnding[];
  setSelectedWeek: (week: WeekEnding) => void;
  onCopyWeek?: (weekToCopy: WeekEnding) => void;
};

export type TimesheetHeadProps = {
  selectedWeek: WeekEnding;
};

export type TimesheetTotalsProps = {
  timeEntries: TimeEntry[];
};

export type TimesheetWorkItemsProps = {
  workItem: CodeWithWorkItems["work_items"][number];
  isExpanded: boolean;
  toggleExpanded: (id: number) => void;
};
