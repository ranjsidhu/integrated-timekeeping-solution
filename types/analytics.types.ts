import type { ReactNode } from "react";

export type TeamMember = {
  id: number;
  name: string;
  email: string;
  weeklyHours: Record<number, number>; // weekEndingId -> hours
  averageUtilization: number;
};

export type TeamUtilizationResult = {
  teamMembers: TeamMember[];
  weekEndings: Array<{ id: number; week_ending: Date; label: string }>;
};

export type AnalyticsMetrics = {
  teamUtilization: number;
  totalBillableHours: number;
  activeAssignments: number;
  forecastCompliance: number;
};

export type MetricsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "green" | "purple" | "dark";
  subtitle?: string;
};

export type TeamCapacityTableProps = {
  teamMembers: TeamMember[];
  weekEndings: Array<{ id: number; week_ending: Date; label: string }>;
};

export type AnalyticsPageProps = {
  initialMetrics: AnalyticsMetrics;
  initialTeamMembers: TeamMember[];
  initialWeekEndings: Array<{ id: number; week_ending: Date; label: string }>;
  initialForecastVsActuals: ForecastVsActualsData;
  initialProjects: ProjectAnalytics[];
};

export type UtilizationTrendChartProps = {
  teamMembers: Array<{
    id: number;
    name: string;
    weeklyHours: Record<number, number>;
  }>;
  weekEndings: Array<{ id: number; week_ending: Date; label: string }>;
};

export type ForecastVsActualsData = {
  weekEndings: Array<{ id: number; week_ending: Date; label: string }>;
  forecastHours: number[];
  actualHours: number[];
  variance: number[];
};

export type ForecastVsActualsChartProps = {
  weekEndings: Array<{ id: number; week_ending: Date; label: string }>;
  forecastHours: number[];
  actualHours: number[];
  variance: number[];
};

export type AnalyticsFiltersProps = {
  weeksToShow: number;
  onWeeksChange: (weeks: number) => void;
};

export type ProjectAnalytics = {
  projectId: number;
  projectName: string;
  forecastHours: number;
  actualHours: number;
  variance: number;
  billableHours: number;
  nonBillableHours: number;
  utilizationRate: number;
  teamMemberCount: number;
};

export type ProjectAnalyticsTableProps = {
  projects: ProjectAnalytics[];
};

export type ExportDataType = "team" | "projects" | "forecast-actuals";

export type TeamExportRow = {
  name: string;
  email: string;
  [key: string]: string | number; // Dynamic week columns
};

export type ProjectExportRow = {
  projectName: string;
  teamSize: number;
  forecastHours: number;
  actualHours: number;
  variance: number;
  billableHours: number;
  nonBillableHours: number;
  utilizationRate: number;
};

export type ForecastActualsExportRow = {
  week: string;
  weekEnding: string;
  forecastHours: number;
  actualHours: number;
  variance: number;
};

export type ProjectData = {
  projectName: string;
  forecastHours: number;
  actualHours: number;
  billableHours: number;
  nonBillableHours: number;
  teamMemberIds: Set<number>;
};

export type ProjectAnalyticsData = {
  projectId: number;
  projectName: string;
  forecastHours: number;
  actualHours: number;
  billableHours: number;
  nonBillableHours: number;
  teamMemberCount: number;
  teamMemberIds: Set<number>;
};
