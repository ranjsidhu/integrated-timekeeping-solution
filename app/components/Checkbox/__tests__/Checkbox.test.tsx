import { fireEvent, render, screen } from "@testing-library/react";
import Checkbox from "../Checkbox";

describe("Checkbox", () => {
  it("renders checkbox with default test id", () => {
    render(<Checkbox id="test-checkbox" labelText="Test Checkbox" />);
    expect(screen.getByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders checkbox with custom test id", () => {
    render(
      <Checkbox
        id="custom-checkbox"
        labelText="Custom Checkbox"
        data-testid="custom-checkbox"
      />,
    );
    expect(screen.getByTestId("custom-checkbox")).toBeInTheDocument();
  });

  it("renders checkbox with label", () => {
    const label = "Test checkbox";
    render(<Checkbox id="label-checkbox" labelText={label} />);
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it("handles checked state", () => {
    render(<Checkbox id="checked-checkbox" labelText="Checked Checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("calls onChange handler when clicked", () => {
    const handleChange = jest.fn();
    render(
      <Checkbox
        id="change-checkbox"
        labelText="Change Checkbox"
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByTestId("checkbox"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(
      <Checkbox
        id="disabled-checkbox"
        labelText="Disabled Checkbox"
        disabled
      />,
    );
    expect(screen.getByTestId("checkbox")).toBeDisabled();
  });
});
