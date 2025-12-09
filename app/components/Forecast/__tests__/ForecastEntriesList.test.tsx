/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { fireEvent, render, screen } from "@testing-library/react";
import type { ForecastEntry } from "@/types/forecast.types";
import ForecastEntriesList from "../ForecastEntriesList";

// Mock Carbon icons to avoid ESM issues in Jest
jest.mock("@carbon/icons-react", () => ({
  ChevronRight: (props: any) => <span data-testid="chevron" {...props} />,
  Edit: () => <span data-testid="icon-edit" />,
  TrashCan: () => <span data-testid="icon-trash" />,
}));

describe("ForecastEntriesList", () => {
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

  it("renders empty state when no entries", () => {
    render(
      <ForecastEntriesList
        forecastEntries={[]}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    expect(screen.getByText(/No entries yet/i)).toBeInTheDocument();
  });

  it("toggles entry details and shows totals", () => {
    render(
      <ForecastEntriesList
        forecastEntries={[baseEntry]}
        onEditEntry={jest.fn()}
        onDeleteEntry={jest.fn()}
      />,
    );

    // Total hours displayed from weekly_hours (5 + 3 = 8)
    const totalHoursNode = screen.getByText(
      (_content, node) => node?.textContent?.replace(/\s/g, "") === "8h",
    );
    expect(totalHoursNode).toBeInTheDocument();
    expect(screen.getByText(/total/i)).toBeInTheDocument();

    const toggle = screen.getByLabelText("Toggle entry details");
    fireEvent.click(toggle);

    // Details should appear when expanded
    const categories = screen.getAllByText("Category");
    expect(categories.length).toBeGreaterThanOrEqual(1);

    // Collapse hides details
    fireEvent.click(toggle);
    expect(screen.queryByText("Client:")).not.toBeInTheDocument();
  });

  it("calls edit and delete handlers", () => {
    const onEditEntry = jest.fn();
    const onDeleteEntry = jest.fn();

    render(
      <ForecastEntriesList
        forecastEntries={[baseEntry]}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    fireEvent.click(screen.getByLabelText("Toggle entry details"));

    fireEvent.click(screen.getByText("Edit"));
    expect(onEditEntry).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("Delete"));
    expect(onDeleteEntry).toHaveBeenCalledWith(1);
  });
});
