/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
/** biome-ignore-all assist/source/organizeImports: Unit tests */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock searchProjects
const mockSearchProjects = jest.fn();
jest.mock("@/app/actions", () => ({
  searchProjects: (...args: any[]) => mockSearchProjects(...args),
}));

// Minimal DatePicker mock: exposes a button to trigger onChange
jest.mock("../../../DatePicker/DatePicker", () => (props: any) => {
  const React = require("react");
  const children = React.Children.toArray(props.children as any);
  const childProps = (children[0] as any)?.props || {};
  const id = childProps.id;
  return (
    <div>
      <div data-testid={`datepicker-${id}`}>{children}</div>
      <button
        type="button"
        data-testid={`datepicker-${id}-change`}
        onClick={() => props.onChange?.([new Date(2025, 11, 1)])}
      />
    </div>
  );
});

// DatePickerInput mock: render an input with given id
jest.mock("../../../DatePickerInput/DatePickerInput", () => (props: any) => (
  <input data-testid={props.id} id={props.id} />
));

// Input mock: prefer data-testid prop
jest.mock("../../../Input/Input", () => (props: any) => (
  <input
    data-testid={props["data-testid"] ?? props.id}
    id={props.id}
    value={props.value}
    onChange={props.onChange}
  />
));

// Button mock: render a button with children text in data-testid
jest.mock("../../../Button/Button", () => (props: any) => (
  <button
    type="button"
    data-testid={`button-${String(props.children).toLowerCase()}`}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </button>
));

import AddEntryStep2 from "../AddEntryStep2";

describe("AddEntryStep2 minimal tests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("Back/Cancel call handlers and Create disabled when incomplete", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep2
        categoryId={undefined}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    // "Next" (primary action) should be disabled (no selection)
    const nextBtn = screen.getByTestId("button-next");
    expect(nextBtn).toBeDisabled();

    // Back and Cancel should call handlers
    fireEvent.click(screen.getByTestId("button-back"));
    fireEvent.click(screen.getByTestId("button-cancel"));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("searches, selects project, sets dates/hours and calls onNext", async () => {
    mockSearchProjects.mockResolvedValueOnce([{ id: 1, project_name: "Proj" }]);

    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep2
        categoryId={2}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    // Type into the project search input (needs >=2 chars)
    const search = screen.getByTestId("add-entry-project-search");
    fireEvent.change(search, { target: { value: "Pr" } });

    // advance debounce if fake timers are used; waitFor will handle async either way
    jest.advanceTimersByTime?.(300);

    await waitFor(() =>
      expect(mockSearchProjects).toHaveBeenCalledWith("Pr", 2),
    );

    // Project item should render
    await waitFor(() => expect(screen.getByText("Proj")).toBeInTheDocument());

    // Select the project
    fireEvent.click(screen.getByText("Proj"));
    expect(screen.getByText(/Selected: Proj/)).toBeInTheDocument();

    // Trigger date pickers to set from/to
    fireEvent.click(screen.getByTestId("datepicker-from-date-change"));
    fireEvent.click(screen.getByTestId("datepicker-to-date-change"));

    // Set hours per week to valid value
    const hours = screen.getByTestId("hours-per-week");
    fireEvent.change(hours, { target: { value: "30" } });

    // Primary action ("Next") should now be enabled
    const nextBtn = screen.getByTestId("button-next");
    expect(nextBtn).not.toBeDisabled();

    // Click to proceed
    fireEvent.click(nextBtn);

    expect(onNext).toHaveBeenCalledTimes(1);
    const payload = onNext.mock.calls[0][0];
    expect(payload.project_id).toBe(1);
    expect(payload.hours_per_week).toBe(30);
    expect(Array.isArray(payload.from_date)).toBe(true);
    expect(Array.isArray(payload.to_date)).toBe(true);
  });
});
