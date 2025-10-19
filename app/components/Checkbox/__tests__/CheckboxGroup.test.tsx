import { render, screen } from "@testing-library/react";
import Checkbox from "../Checkbox";
import CheckboxGroup from "../CheckboxGroup";

describe("CheckboxGroup", () => {
  it("renders checkbox group with default test id", () => {
    render(
      <CheckboxGroup legendText="Test Group">
        <Checkbox id="test-checkbox-1" labelText="Option 1" />
      </CheckboxGroup>,
    );
    expect(screen.getByTestId("checkbox-group")).toBeInTheDocument();
  });

  it("renders checkbox group with custom test id", () => {
    render(
      <CheckboxGroup legendText="Custom Group" data-testid="custom-group">
        <Checkbox id="test-checkbox-1" labelText="Option 1" />
      </CheckboxGroup>,
    );
    expect(screen.getByTestId("custom-group")).toBeInTheDocument();
  });

  it("renders checkbox group with multiple checkboxes", () => {
    render(
      <CheckboxGroup legendText="Multiple Options">
        <Checkbox id="test-checkbox-1" labelText="Option 1" />
        <Checkbox id="test-checkbox-2" labelText="Option 2" />
        <Checkbox id="test-checkbox-3" labelText="Option 3" />
      </CheckboxGroup>,
    );

    expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 3")).toBeInTheDocument();
  });

  it("renders with legend text", () => {
    const legendText = "Group Legend";
    render(
      <CheckboxGroup legendText={legendText}>
        <Checkbox id="test-checkbox-1" labelText="Option 1" />
      </CheckboxGroup>,
    );
    expect(screen.getByText(legendText)).toBeInTheDocument();
  });

  it("supports disabled individual checkboxes", () => {
    render(
      <CheckboxGroup legendText="Group with Disabled Items">
        <Checkbox id="test-checkbox-1" labelText="Option 1" disabled />
        <Checkbox id="test-checkbox-2" labelText="Option 2" />
      </CheckboxGroup>,
    );

    expect(screen.getByLabelText("Option 1")).toBeDisabled();
    expect(screen.getByLabelText("Option 2")).not.toBeDisabled();
  });

  it("maintains individual checkbox states", () => {
    render(
      <CheckboxGroup legendText="Group with Different States">
        <Checkbox id="test-checkbox-1" labelText="Option 1" defaultChecked />
        <Checkbox id="test-checkbox-2" labelText="Option 2" />
      </CheckboxGroup>,
    );

    expect(screen.getByLabelText("Option 1")).toBeChecked();
    expect(screen.getByLabelText("Option 2")).not.toBeChecked();
  });
});
