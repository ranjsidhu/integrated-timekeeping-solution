/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";
import type { WeekEnding } from "@/types/timesheet.types";

// Mock carbon icons to avoid ESM parsing issues
jest.mock("@carbon/icons-react", () => ({
  ChartLine: () => <span data-testid="icon-chartline" />,
  Time: () => <span data-testid="icon-time" />,
}));

import ForecastSummary from "../ForecastSummary";

describe("ForecastSummary", () => {
  const mockWeekEndings: WeekEnding[] = [
    { id: 1, week_ending: new Date(2025, 0, 7), label: "W1", status: "Open" },
    { id: 2, week_ending: new Date(2025, 0, 14), label: "W2", status: "Open" },
    { id: 3, week_ending: new Date(2025, 0, 21), label: "W3", status: "Open" },
  ];

  it("calculates total hours and active projects correctly (distinct projects)", () => {
    const forecastEntries = [
      {
        project_id: 1,
        category_name: "Billable",
        hours_per_week: 5,
        weekly_hours: { 1: 5, 2: 5, 3: 5 },
      } as any,
      {
        project_id: 2,
        category_name: "Billable",
        hours_per_week: 10,
        weekly_hours: { 1: 10, 2: 10, 3: 10 },
      } as any,
    ];

    render(
      <ForecastSummary
        forecastEntries={forecastEntries}
        weekEndings={mockWeekEndings}
      />,
    );

    // totalHours = (5 + 5 + 5) + (10 + 10 + 10) = 45
    const hoursElements = screen.getAllByText(/45h/);
    expect(hoursElements).toHaveLength(2); // Total and Billable both show 45h

    // active projects = 2
    expect(screen.getByText("2")).toBeInTheDocument();

    // billable hours = 45 (both entries are billable) - already checked above

    // utilization = 100%
    expect(screen.getByText(/100\.0%/)).toBeInTheDocument();

    // icons rendered
    const timeIcons = screen.getAllByTestId("icon-time");
    expect(timeIcons).toHaveLength(2); // Total Hours and Billable Hours cards

    const chartIcons = screen.getAllByTestId("icon-chartline");
    expect(chartIcons).toHaveLength(2); // Active Projects and Utilization cards
  });

  it("counts active projects correctly when same project appears multiple times", () => {
    const forecastEntries = [
      {
        project_id: 1,
        category_name: "Billable",
        hours_per_week: 8,
        weekly_hours: { 1: 8, 2: 8 },
      } as any,
      {
        project_id: 1,
        category_name: "Non-Billable",
        hours_per_week: 8,
        weekly_hours: { 1: 8, 2: 8 },
      } as any,
    ];

    render(
      <ForecastSummary
        forecastEntries={forecastEntries}
        weekEndings={mockWeekEndings}
      />,
    );

    // totalHours = (8 + 8) + (8 + 8) = 32
    expect(screen.getByText(/32h/)).toBeInTheDocument();
    // active projects = 1 (same project_id)
    expect(screen.getByText("1")).toBeInTheDocument();
    // billable hours = 16 (only first entry is billable)
    expect(screen.getByText(/16h/)).toBeInTheDocument();
    // utilization = 50%
    expect(screen.getByText(/50\.0%/)).toBeInTheDocument();
  });

  it("calculates billable utilization correctly", () => {
    const forecastEntries = [
      {
        project_id: 1,
        category_name: "Billable",
        hours_per_week: 30,
        weekly_hours: { 1: 30 },
      } as any,
      {
        project_id: 2,
        category_name: "Non-Billable",
        hours_per_week: 10,
        weekly_hours: { 1: 10 },
      } as any,
    ];

    render(
      <ForecastSummary
        forecastEntries={forecastEntries}
        weekEndings={mockWeekEndings}
      />,
    );

    // Total hours = 40
    expect(screen.getByText(/40h/)).toBeInTheDocument();
    // Billable hours = 30
    expect(screen.getByText(/30h/)).toBeInTheDocument();
    // Utilization = 75%
    expect(screen.getByText(/75\.0%/)).toBeInTheDocument();
  });

  it("handles zero hours correctly", () => {
    const forecastEntries = [
      {
        project_id: 1,
        category_name: "Billable",
        hours_per_week: 0,
        weekly_hours: {},
      } as any,
    ];

    render(
      <ForecastSummary
        forecastEntries={forecastEntries}
        weekEndings={mockWeekEndings}
      />,
    );

    // Total hours = 0 (appears in both Total and Billable cards)
    const zeroHours = screen.getAllByText(/0h/);
    expect(zeroHours).toHaveLength(2);

    // Utilization = 0%
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it("only counts hours from provided week endings", () => {
    const forecastEntries = [
      {
        project_id: 1,
        category_name: "Billable",
        hours_per_week: 10,
        weekly_hours: { 1: 10, 2: 10, 99: 100 }, // week 99 shouldn't be counted
      } as any,
    ];

    render(
      <ForecastSummary
        forecastEntries={forecastEntries}
        weekEndings={mockWeekEndings}
      />,
    );

    // Should only count weeks 1 and 2 = 20h, not week 99 (appears in both Total and Billable)
    const twentyHours = screen.getAllByText(/20h/);
    expect(twentyHours).toHaveLength(2); // Total and Billable both show 20h
  });
});
