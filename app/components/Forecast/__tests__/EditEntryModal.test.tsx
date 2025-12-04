/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { fireEvent, render, screen } from "@testing-library/react";
import type { Category, ForecastEntry } from "@/types/forecast.types";
import EditEntryModal from "../EditEntryModal";

// Mock shared components
jest.mock("@/app/components", () => ({
  Modal: (props: any) =>
    props.open ? <div data-testid="modal">{props.children}</div> : null,
  ProgressIndicator: (props: any) => (
    <div data-testid="progress-indicator">{props.children}</div>
  ),
  ProgressStep: (props: any) => (
    <div data-testid="progress-step">{props.children}</div>
  ),
}));

// Mock step components
jest.mock("../AddEntrySteps/AddEntryStep1", () => (props: any) => (
  <div>
    <div data-testid="step1-initial">{props.initialCategoryId}</div>
    <button
      type="button"
      data-testid="step1-next"
      onClick={() => props.onNext({ category_id: 42 })}
    >
      Next Step1
    </button>
  </div>
));

jest.mock("../AddEntrySteps/AddEntryStep2", () => (props: any) => (
  <div>
    <div data-testid="step2-initial-project">
      {props.initialData?.project_id}
    </div>
    <div data-testid="step2-initial-hours">
      {props.initialData?.hours_per_week}
    </div>
    <button type="button" data-testid="step2-back" onClick={props.onBack}>
      Back
    </button>
    <button
      type="button"
      data-testid="step2-complete"
      onClick={() =>
        props.onNext({
          project_id: 100,
          from_date: [new Date(2025, 0, 1)],
          to_date: [new Date(2025, 0, 7)],
          hours_per_week: 16,
        })
      }
    >
      Save
    </button>
  </div>
));

describe("EditEntryModal", () => {
  const categories: Category[] = [
    {
      id: 1,
      category_name: "Cat",
      assignment_type: "Productive",
      description: "",
    },
  ];

  const entry: ForecastEntry = {
    id: 7,
    forecast_plan_id: 1,
    category_id: 1,
    category_name: "Cat",
    assignment_type: "Productive",
    project_id: 5,
    project_name: "P",
    from_date: new Date(2024, 11, 1),
    to_date: new Date(2024, 11, 8),
    hours_per_week: 20,
    potential_extension: null,
    weekly_hours: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  it("prefills data and completes save flow", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <EditEntryModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        categories={categories}
        entry={entry}
      />,
    );

    // Step1 shows initial category id
    expect(screen.getByTestId("step1-initial")).toHaveTextContent("1");

    // Advance to step2
    fireEvent.click(screen.getByTestId("step1-next"));

    // Step2 receives initial data
    expect(screen.getByTestId("step2-initial-project")).toHaveTextContent("5");
    expect(screen.getByTestId("step2-initial-hours")).toHaveTextContent("20");

    // Complete and save
    fireEvent.click(screen.getByTestId("step2-complete"));

    expect(onSave).toHaveBeenCalledTimes(1);
    const [savedId, savedEntry] = onSave.mock.calls[0];
    expect(savedId).toBe(7);
    expect(savedEntry.category_id).toBe(42); // from step1 override
    expect(savedEntry.project_id).toBe(100);
    expect(savedEntry.hours_per_week).toBe(16);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("supports back navigation to step1", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <EditEntryModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        categories={categories}
        entry={entry}
      />,
    );

    fireEvent.click(screen.getByTestId("step1-next"));
    fireEvent.click(screen.getByTestId("step2-back"));

    expect(screen.getByTestId("step1-next")).toBeInTheDocument();
  });
});
