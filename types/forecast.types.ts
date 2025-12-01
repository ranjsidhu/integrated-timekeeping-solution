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
  weekly_hours?: Record<number, number>; // weekEndingId -> hours
  created_at?: Date | string;
  updated_at?: Date | string;
};

export type ForecastProps = {
  weekEndings: WeekEnding[];
};
