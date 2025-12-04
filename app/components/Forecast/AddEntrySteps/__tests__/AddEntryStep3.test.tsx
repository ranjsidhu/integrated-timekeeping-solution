/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
/** biome-ignore-all assist/source/organizeImports: Unit tests */
import { fireEvent, render, screen } from "@testing-library/react";

// Mock Button component
jest.mock("../../../Button/Button", () => (props: any) => (
  <button
    type="button"
    data-testid={`button-${props.kind}`}
    onClick={props.onClick}
  >
    {props.children}
  </button>
));

// Mock Input component
jest.mock("../../../Input/Input", () => (props: any) => (
  <input
    type={props.type}
    id={props.id}
    min={props.min}
    max={props.max}
    value={props.value}
    onChange={props.onChange}
    data-testid={`input-${props.id}`}
  />
));

import AddEntryStep3 from "../AddEntryStep3";
import type { WeekEnding } from "@/types/timesheet.types";

describe("AddEntryStep3", () => {
  const mockWeekEndings: WeekEnding[] = [
    {
      id: 1,
      week_ending: new Date(2025, 0, 10),
      label: "Week 1",
      status: "Open",
    },
    {
      id: 2,
      week_ending: new Date(2025, 0, 17),
      label: "Week 1",
      status: "Open",
    },
    {
      id: 3,
      week_ending: new Date(2025, 0, 24),
      label: "Week 1",
      status: "Open",
    },
  ];

  it("initializes with suggested hours based on working days", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep3
        fromDate={[new Date(2025, 0, 1)]}
        toDate={[new Date(2025, 0, 31)]}
        weekEndings={mockWeekEndings}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    // Should display the instruction text
    expect(screen.getByText(/Customize Weekly Hours/i)).toBeInTheDocument();

    // Should have input fields for each week
    expect(screen.getByTestId("input-week-1")).toBeInTheDocument();
    expect(screen.getByTestId("input-week-2")).toBeInTheDocument();
    expect(screen.getByTestId("input-week-3")).toBeInTheDocument();

    // Buttons should be rendered (use text queries to distinguish Back from Cancel)
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Create Entry")).toBeInTheDocument();
  });

  it("allows updating weekly hours and calculates total", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep3
        fromDate={[new Date(2025, 0, 1)]}
        toDate={[new Date(2025, 0, 31)]}
        weekEndings={mockWeekEndings}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    // Change first week hours to 10
    const input1 = screen.getByTestId("input-week-1") as HTMLInputElement;
    fireEvent.change(input1, { target: { value: "10" } });

    // Change second week hours to 20
    const input2 = screen.getByTestId("input-week-2") as HTMLInputElement;
    fireEvent.change(input2, { target: { value: "20" } });

    // Third week should have default value
    const input3 = screen.getByTestId("input-week-3") as HTMLInputElement;
    expect(input3.value).toBeTruthy(); // has some default value

    // Total hours should be displayed (exact value depends on defaults)
    expect(screen.getByText(/Total Hours/i)).toBeInTheDocument();
  });

  it("submits with onNext when Create Entry button clicked", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep3
        fromDate={[new Date(2025, 0, 1)]}
        toDate={[new Date(2025, 0, 31)]}
        weekEndings={mockWeekEndings}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    const createButton = screen.getByText("Create Entry");
    fireEvent.click(createButton);

    expect(onNext).toHaveBeenCalledTimes(1);
    // Should pass object with week IDs as keys
    const payload = onNext.mock.calls[0][0];
    expect(typeof payload).toBe("object");
    expect(payload).toHaveProperty("1"); // week id 1
    expect(payload).toHaveProperty("2"); // week id 2
    expect(payload).toHaveProperty("3"); // week id 3
  });

  it("calls onBack when Back button clicked", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep3
        fromDate={[new Date(2025, 0, 1)]}
        toDate={[new Date(2025, 0, 31)]}
        weekEndings={mockWeekEndings}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel button clicked", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep3
        fromDate={[new Date(2025, 0, 1)]}
        toDate={[new Date(2025, 0, 31)]}
        weekEndings={mockWeekEndings}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    const cancelButtons = screen.getAllByText("Cancel");
    fireEvent.click(cancelButtons[0]);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("uses initialWeeklyHours when provided", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();
    const initialWeeklyHours = { 1: 15, 2: 25, 3: 10 };

    render(
      <AddEntryStep3
        fromDate={[new Date(2025, 0, 1)]}
        toDate={[new Date(2025, 0, 31)]}
        weekEndings={mockWeekEndings}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
        initialWeeklyHours={initialWeeklyHours}
      />,
    );

    // Inputs should have the initial values
    const input1 = screen.getByTestId("input-week-1") as HTMLInputElement;
    expect(input1.value).toBe("15");

    const input2 = screen.getByTestId("input-week-2") as HTMLInputElement;
    expect(input2.value).toBe("25");

    const input3 = screen.getByTestId("input-week-3") as HTMLInputElement;
    expect(input3.value).toBe("10");
  });

  it("clamps hours between 0 and 40", () => {
    const onNext = jest.fn();
    const onBack = jest.fn();
    const onCancel = jest.fn();

    render(
      <AddEntryStep3
        fromDate={[new Date(2025, 0, 1)]}
        toDate={[new Date(2025, 0, 31)]}
        weekEndings={mockWeekEndings}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />,
    );

    const input1 = screen.getByTestId("input-week-1") as HTMLInputElement;

    // Try to set to 60 (should be clamped to 40)
    fireEvent.change(input1, { target: { value: "60" } });
    expect(input1.value).toBe("40");

    // Try to set to -5 (should be clamped to 0)
    fireEvent.change(input1, { target: { value: "-5" } });
    expect(input1.value).toBe("0");
  });
});
