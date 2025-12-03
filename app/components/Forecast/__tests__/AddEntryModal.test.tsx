/** biome-ignore-all assist/source/organizeImports: Unit tests */
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen, fireEvent } from "@testing-library/react";

// Mock shared components exported from '@/app/components'
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

// Mock AddEntryStep1 and AddEntryStep2
jest.mock("../AddEntrySteps/AddEntryStep1", () => (props: any) => {
  return (
    <div>
      <button
        type="button"
        data-testid="step1-next"
        onClick={() => props.onNext({ category_id: 10 })}
      >
        Step1 Next
      </button>
    </div>
  );
});

jest.mock("../AddEntrySteps/AddEntryStep2", () => (props: any) => {
  return (
    <div>
      <button
        type="button"
        data-testid="step2-back"
        onClick={() => props.onBack?.()}
      >
        Back
      </button>
      <button
        type="button"
        data-testid="step2-complete"
        onClick={() =>
          props.onNext?.({
            project_id: 20,
            from_date: [new Date(2025, 0, 1)],
            to_date: [new Date(2025, 0, 7)],
            hours_per_week: 8,
          })
        }
      >
        Complete
      </button>
    </div>
  );
});

import AddEntryModal from "../AddEntryModal";
import type { Category } from "@/types/forecast.types";

describe("AddEntryModal", () => {
  it("completes flow: step1 -> step2 -> save and close", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    const categories: Category[] = [
      {
        id: 1,
        category_name: "C",
        assignment_type: "Productive",
        description: "",
      },
    ];

    render(
      <AddEntryModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        categories={categories}
      />,
    );

    // Step1 next should be visible
    const step1Next = screen.getByTestId("step1-next");
    fireEvent.click(step1Next);

    // Step2 complete button should be visible
    const complete = screen.getByTestId("step2-complete");
    fireEvent.click(complete);

    // onSave should be called with the combined entry (category_id from step1)
    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.category_id).toBe(10);
    expect(payload.project_id).toBe(20);
    expect(payload.hours_per_week).toBe(8);

    // modal should close via onClose
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("navigates back from step2 to step1", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    const categories: Category[] = [
      {
        id: 1,
        category_name: "C",
        assignment_type: "Productive",
        description: "",
      },
    ];

    render(
      <AddEntryModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        categories={categories}
      />,
    );

    // go to step2
    fireEvent.click(screen.getByTestId("step1-next"));

    // click back
    fireEvent.click(screen.getByTestId("step2-back"));

    // step1 should be visible again (its next button present)
    expect(screen.getByTestId("step1-next")).toBeInTheDocument();
  });
});
