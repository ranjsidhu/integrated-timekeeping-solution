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
    { id: 2, week_ending: new Date(2025, 0, 14), label: "W2", status: "s" },
    { id: 3, week_ending: new Date(2025, 0, 21), label: "W3", status: "s" },
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

    // Project name and category
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();

    // Weekly hours badges should show 5 and 3
    const badges = screen.getAllByRole("cell");
    const badge5 = badges.find((cell) => cell.textContent === "5");
    const badge3 = badges.find((cell) => cell.textContent === "3");
    expect(badge5).toBeInTheDocument();
    expect(badge3).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText("Assignment")).toBeInTheDocument();
    expect(screen.getByText("Start Date")).toBeInTheDocument();
    expect(screen.getByText("End Date")).toBeInTheDocument();
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

  it("shows totals row with correct weekly totals", () => {
    render(
      <ForecastTimeline
        forecastEntries={[baseEntry]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Should show "Total Assigned" row
    expect(screen.getByText("Total Assigned")).toBeInTheDocument();

    // Week totals: Week 1 = 5, Week 2 = 3, Week 3 = 0
    const totalCells = screen.getAllByRole("cell");

    // Find cells in the totals row (after "Total Assigned")
    const totalAssignedIndex = totalCells.findIndex(
      (cell) => cell.textContent === "Total Assigned",
    );

    // Skip 3 empty cells (Start Date, End Date, Extension), then check weekly totals
    expect(totalCells[totalAssignedIndex + 4].textContent).toBe("5");
    expect(totalCells[totalAssignedIndex + 5].textContent).toBe("3");
    expect(totalCells[totalAssignedIndex + 6].textContent).toBe("0");
  });

  it("renders multiple entries correctly", () => {
    const entry2: ForecastEntry = {
      ...baseEntry,
      id: 2,
      project_name: "Beta",
      weekly_hours: { 1: 8, 2: 8 },
    };

    render(
      <ForecastTimeline
        forecastEntries={[baseEntry, entry2]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Both projects shown
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    // Total Assigned row should show combined hours
    expect(screen.getByText("Total Assigned")).toBeInTheDocument();

    // Week 1 = 5+8=13, Week 2 = 3+8=11
    const totalCells = screen.getAllByRole("cell");
    const totalAssignedIndex = totalCells.findIndex(
      (cell) => cell.textContent === "Total Assigned",
    );

    // Skip 3 empty cells (Start Date, End Date, Extension), then check weekly totals
    expect(totalCells[totalAssignedIndex + 4].textContent).toBe("13");
    expect(totalCells[totalAssignedIndex + 5].textContent).toBe("11");
  });

  it("displays week headers correctly", () => {
    render(
      <ForecastTimeline
        forecastEntries={[baseEntry]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Check for week headers W1, W2, W3
    expect(screen.getByText("W1")).toBeInTheDocument();
    expect(screen.getByText("W2")).toBeInTheDocument();
    expect(screen.getByText("W3")).toBeInTheDocument();

    // Check for dates
    expect(screen.getByText("Jan 7")).toBeInTheDocument();
    expect(screen.getByText("Jan 14")).toBeInTheDocument();
    expect(screen.getByText("Jan 21")).toBeInTheDocument();
  });

  it("shows empty cell for weeks with no hours", () => {
    render(
      <ForecastTimeline
        forecastEntries={[baseEntry]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Week 3 should show "-" since no hours are assigned
    const cells = screen.getAllByRole("cell");
    const emptyCells = cells.filter((cell) => cell.textContent === "-");

    // Should have at least one "-" for week 3 and one for extension
    expect(emptyCells.length).toBeGreaterThanOrEqual(2);
  });

  it("renders extension date when provided", () => {
    const entryWithExtension: ForecastEntry = {
      ...baseEntry,
      potential_extension: new Date(2025, 0, 28),
    };

    render(
      <ForecastTimeline
        forecastEntries={[entryWithExtension]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Expect formatted extension date to appear, not '-'
    expect(screen.queryByText("-")).toBeInTheDocument(); // dash may exist elsewhere
    expect(screen.getByText("Jan 28, 2025")).toBeInTheDocument();
  });

  it("applies avatar color based on category", () => {
    const holidayEntry: ForecastEntry = {
      ...baseEntry,
      id: 3,
      category_name: "Holiday",
      project_name: "HolidayProj",
    };
    const trainingEntry: ForecastEntry = {
      ...baseEntry,
      id: 4,
      category_name: "Training",
      project_name: "TrainingProj",
    };
    const billableEntry: ForecastEntry = {
      ...baseEntry,
      id: 5,
      category_name: "Billable",
      project_name: "BillableProj",
    };

    render(
      <ForecastTimeline
        forecastEntries={[holidayEntry, trainingEntry, billableEntry]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Robust: locate each row by project name and assert avatar with expected bg class exists
    const holidayRow = screen.getByText("HolidayProj").closest("tr");
    const trainingRow = screen.getByText("TrainingProj").closest("tr");
    const billableRow = screen.getByText("BillableProj").closest("tr");

    const holidayAvatar = holidayRow?.querySelector("div.rounded-lg");
    const trainingAvatar = trainingRow?.querySelector("div.rounded-lg");
    const billableAvatar = billableRow?.querySelector("div.rounded-lg");

    expect(holidayAvatar?.className).toContain("bg-[#8a3ffc]");
    expect(trainingAvatar?.className).toContain("bg-[#0f62fe]");
    expect(billableAvatar?.className).toContain("bg-[#24a148]");
  });

  it("renders start and end dates correctly", () => {
    render(
      <ForecastTimeline
        forecastEntries={[baseEntry]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Expect formatted start/end date cells
    expect(screen.getByText("Jan 1, 2025")).toBeInTheDocument();
    expect(screen.getByText("Jan 7, 2025")).toBeInTheDocument();
  });

  it("highlights problem weeks in header, rows, and totals", () => {
    const problemWeeks = [2];

    render(
      <ForecastTimeline
        forecastEntries={[baseEntry]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
        problemWeeks={problemWeeks}
      />,
    );

    // Header cell for W2 should have error styles
    const w2Header = screen.getByText("W2").closest("th");
    expect(w2Header).toHaveClass("bg-[#ffd7d9]");
    expect(w2Header).toHaveClass("text-[#da1e28]");

    // Body cell for week 2 should have error bg
    const cells = screen.getAllByRole("cell");
    // At least one body cell should include the error bg when week 2 is present
    expect(
      cells.some(
        (c) =>
          c.className.includes("bg-[#fff1f1]") &&
          c.className.includes("border-[#ffb3b8]"),
      ),
    ).toBe(true);

    // Totals row for week 2 should have error styles
    const totalCells = screen.getAllByRole("cell");
    const totalAssignedIndex = totalCells.findIndex(
      (cell) => cell.textContent === "Total Assigned",
    );
    const w2TotalCell = totalCells[totalAssignedIndex + 5];
    expect(w2TotalCell.className).toContain("bg-[#ffd7d9]");
    expect(w2TotalCell.className).toContain("text-[#da1e28]");
  });

  it("shows 0 in totals when no hours for a week", () => {
    const entryNoWeek3: ForecastEntry = {
      ...baseEntry,
      weekly_hours: { 1: 5, 2: 3 },
    };

    render(
      <ForecastTimeline
        forecastEntries={[entryNoWeek3]}
        weekEndings={weekEndings}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    const totalCells = screen.getAllByRole("cell");
    const totalAssignedIndex = totalCells.findIndex(
      (cell) => cell.textContent === "Total Assigned",
    );

    // Week 3 total cell should display 0 when no hours across entries
    expect(totalCells[totalAssignedIndex + 6].textContent).toBe("0");
  });
});
