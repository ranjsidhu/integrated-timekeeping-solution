import type { WeekEnding } from "./timesheet.types";

export type ForecastEntry = {
  id: number;
  forecast_plan_id: number;
  category_id: number;
  category_name: string;
  assignment_type: string;
  project_id: number;
  project_name: string;
  client_name?: string;
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
  client_name?: string;
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
