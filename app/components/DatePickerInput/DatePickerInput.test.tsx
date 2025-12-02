/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock Carbon DatePickerInput to avoid ESM import in Jest
jest.mock("@carbon/react", () => ({
  DatePickerInput: (props: any) => (
    <div data-testid={props["data-testid"] ?? "carbon-date-picker-input"}>
      {props.children}
    </div>
  ),
}));

import DatePickerInput from "./DatePickerInput";

describe("DatePickerInput component", () => {
  it("uses default data-testid when none provided", () => {
    render(<DatePickerInput id="test" labelText="Test" />);

    expect(screen.getByTestId("date-picker-input")).toBeInTheDocument();
  });

  it("uses provided data-testid", () => {
    render(
      <DatePickerInput data-testid="custom-input" id="test" labelText="Test" />,
    );

    expect(screen.getByTestId("custom-input")).toBeInTheDocument();
  });
});
