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
  metrics: AnalyticsMetrics;
  teamMembers: TeamMember[];
  weekEndings: Array<{ id: number; week_ending: Date; label: string }>;
};
