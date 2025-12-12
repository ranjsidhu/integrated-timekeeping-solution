import type { WeekEnding } from "./timesheet.types";

export type ForecastEntry = {
  id: number;
  forecast_plan_id: number;
  category_id: number;
  category_name: string;
  assignment_type: string;
  project_id: number;
  project_name: string;
  from_date: Date | string;
  to_date: Date | string;
  potential_extension?: Date | string | null;
  hours_per_week: number;
  weekly_hours?: Record<number, number>;
  created_at?: Date | string;
  updated_at?: Date | string;
};

export type ForecastProps = {
  weekEndings: WeekEnding[];
};

export type Category = {
  id: number;
  category_name: string;
  assignment_type: "Productive" | "Non-Productive";
  description: string;
};

export type Project = {
  id: number;
  project_name: string;
};

export type CategoryProps = {
  category: Category;
  onSelect: (category: Category) => void;
  isSelected: boolean;
};

export type AddEntryStep1Props = {
  categories: Category[];
  onNext: (data: { category_id: number }) => void;
  onCancel: () => void;
  initialCategoryId?: number;
};

export type AddEntryStep2Props = {
  categoryId: number | undefined;
  onNext: (data: {
    project_id: number;
    from_date: Date[];
    to_date: Date[];
    hours_per_week: number;
    potential_extension?: Date[];
  }) => void;
  onBack: () => void;
  onCancel: () => void;
  initialData?: {
    project_id?: number;
    from_date?: Date[];
    to_date?: Date[];
    hours_per_week?: number;
    potential_extension?: Date[];
  };
};

export type AddEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: NewForecastEntry) => void;
  categories: Category[];
  weekEndings: WeekEnding[];
  existingEntries: ForecastEntry[];
};

export type NewForecastEntry = {
  category_id: number;
  project_id: number;
  from_date: Date[];
  to_date: Date[];
  hours_per_week: number;
  potential_extension?: Date[];
  weekly_hours?: Record<number, number>;
};

export type AddEntryStep3Props = {
  fromDate: Date[];
  toDate: Date[];
  weekEndings: WeekEnding[];
  existingEntries: ForecastEntry[];
  editingEntryId?: number;
  onNext: (weeklyHours: Record<number, number>) => void;
  onBack: () => void;
  onCancel: () => void;
  initialWeeklyHours?: Record<number, number>;
  defaultHoursPerWeek: number;
};

export type EditEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entryId: number, entry: NewForecastEntry) => void;
  categories: Category[];
  weekEndings: WeekEnding[];
  existingEntries: ForecastEntry[];
  entry: ForecastEntry | null;
};

export type WeeklyValidationError = {
  weekId: number;
  weekLabel: string;
  currentTotal: number;
  newHours: number;
  finalTotal: number;
};

export type ValidationResult = {
  isValid: boolean;
  errors: WeeklyValidationError[];
};

export type ForecastPageExtendedProps = ForecastProps & {
  categories: Category[];
};

export type CreateForecastEntryResult = {
  success: boolean;
  entryId?: number;
  error?: string;
};

export type DeleteForecastEntryResult = {
  success: boolean;
  error?: string;
};

export type GetForecastPlanResult = {
  success: boolean;
  entries?: ForecastEntry[];
  status?: string;
  error?: string;
};

export type SaveForecastPlanResult = {
  success: boolean;
  error?: string;
};

export type SearchProjectResponse = {
  id: number;
  project_name: string;
  code?: string;
};

export type SubmitForecastPlanResult = {
  success: boolean;
  status?: string;
  error?: string;
  validationErrors?: Array<{
    weekId: number;
    weekEnding: Date;
    total: number;
  }>;
};

export type UpdateForecastEntryResult = {
  success: boolean;
  error?: string;
};

export type ForecastEntriesListProps = {
  forecastEntries: ForecastEntry[];
  onEditEntry: (entryId: number) => void;
  onDeleteEntry: (entryId: number) => void;
};

export type ForecastHeaderProps = {
  status: string;
  viewMode: "timeline" | "list";
  onViewModeChange: (mode: "timeline" | "list") => void;
  onAddEntry: () => void;
  onSave: () => void;
  onSubmit: () => void;
};

export type ForecastSummaryProps = {
  forecastEntries: ForecastEntry[];
  weekEndings: WeekEnding[];
};

export type ForecastTimelineProps = {
  forecastEntries: ForecastEntry[];
  weekEndings: WeekEnding[];
  onEditEntry: (entryId: number) => void;
  onDeleteEntry: (entryId: number) => void;
  problemWeeks?: number[];
};
