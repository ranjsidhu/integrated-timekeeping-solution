/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { fireEvent, render, screen } from "@testing-library/react";
import type { ForecastEntry } from "@/types/forecast.types";
import type { WeekEnding } from "@/types/timesheet.types";
import ForecastTimeline from "../ForecastTimeline";

// Mock Carbon icons to avoid ESM issues
jest.mock("@carbon/icons-react", () => ({
  Edit: () => <span data-testid="icon-edit" />,
  TrashCan: () => <span data-testid="icon-trash" />,
}));

describe("ForecastTimeline", () => {
  const baseEntry: ForecastEntry = {
    id: 1,
    forecast_plan_id: 1,
    category_id: 1,
    category_name: "Category",
    assignment_type: "Productive",
    project_id: 10,
    project_name: "Alpha",
    from_date: new Date(2025, 0, 1),
    to_date: new Date(2025, 0, 7),
    potential_extension: null,
    hours_per_week: 8,
    weekly_hours: { 1: 5, 2: 3 },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const weekEndings: WeekEnding[] = [
    { id: 1, week_ending: new Date(2025, 0, 7), label: "W1", status: "s" },
    { id: 2, week_ending: new Date(2025, 0, 14), label: "W1", status: "s" },
    { id: 3, week_ending: new Date(2025, 0, 21), label: "W1", status: "s" },
  ];

  it("renders empty state when no entries", () => {
    render(
      <ForecastTimeline
        forecastEntries={[]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    expect(screen.getByText(/No entries yet/i)).toBeInTheDocument();
    expect(screen.getByLabelText("calendar-icon")).toBeInTheDocument();
  });

  it("renders timeline cards with weekly hours and total", () => {
    render(
      <ForecastTimeline
        forecastEntries={[baseEntry]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Project and client info
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    // Weekly hours blocks W1/W2 should show 5h and 3h
    expect(screen.getByText("5h")).toBeInTheDocument();
    expect(screen.getByText("3h")).toBeInTheDocument();

    // Total hours shown (5 + 3 = 8)
    expect(screen.getAllByText(/8h/).length).toBeGreaterThanOrEqual(1);
  });

  it("calls edit and delete handlers", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <ForecastTimeline
        forecastEntries={[baseEntry]}
        weekEndings={weekEndings}
        onEditEntry={onEdit}
        onDeleteEntry={onDelete}
      />,
    );

    fireEvent.click(screen.getByLabelText("Edit entry"));
    expect(onEdit).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText("Delete entry"));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
