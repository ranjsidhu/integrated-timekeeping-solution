import { fireEvent, render, screen } from "@testing-library/react";
import TimesheetActions from "@/app/components/Timesheet/TimesheetActions";

describe("TimesheetActions", () => {
  test("renders Save and Submit and calls handlers", () => {
    const handleSave = jest.fn();
    const handleSubmit = jest.fn();

    render(
      <TimesheetActions handleSave={handleSave} handleSubmit={handleSubmit} />,
    );

    const save = screen.getByText("Save");
    const submit = screen.getByText("Submit");

    expect(save).toBeInTheDocument();
    expect(submit).toBeInTheDocument();

    fireEvent.click(save);
    fireEvent.click(submit);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test("exposes buttons with button role", () => {
    const handleSave = jest.fn();
    const handleSubmit = jest.fn();

    render(
      <TimesheetActions handleSave={handleSave} handleSubmit={handleSubmit} />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
