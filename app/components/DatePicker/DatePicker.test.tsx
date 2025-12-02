/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock Carbon DatePicker to avoid importing ESM module in tests
jest.mock("@carbon/react", () => ({
  DatePicker: (props: any) => (
    <div data-testid={props["data-testid"] ?? "carbon-date-picker"}>
      {props.children}
    </div>
  ),
}));

import DatePicker from "./DatePicker";

describe("DatePicker component", () => {
  it("uses default data-testid when none provided", () => {
    render(
      <DatePicker>
        <div></div>
      </DatePicker>,
    );

    expect(screen.getByTestId("date-picker")).toBeInTheDocument();
  });

  it("uses provided data-testid", () => {
    render(
      <DatePicker data-testid="custom-date">
        <div></div>
      </DatePicker>,
    );

    expect(screen.getByTestId("custom-date")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <DatePicker>
        <span>Inner</span>
      </DatePicker>,
    );

    expect(screen.getByText("Inner")).toBeInTheDocument();
  });
});
