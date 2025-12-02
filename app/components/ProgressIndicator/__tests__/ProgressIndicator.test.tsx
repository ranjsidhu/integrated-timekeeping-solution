/** biome-ignore-all assist/source/organizeImports: Unit tests */
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock Carbon ProgressIndicator to avoid ESM import issues in Jest
jest.mock("@carbon/react", () => ({
  ProgressIndicator: (props: any) => (
    <div data-testid={props["data-testid"] ?? "carbon-progress-indicator"}>
      {props.children}
    </div>
  ),
}));

import ProgressIndicator from "../ProgressIndicator";

describe("ProgressIndicator component", () => {
  it("renders with default data-testid when none provided", () => {
    render(<ProgressIndicator />);
    expect(screen.getByTestId("progress-indicator")).toBeInTheDocument();
  });

  it("renders with provided data-testid", () => {
    render(
      <ProgressIndicator data-testid="custom-progress">
        Hello
      </ProgressIndicator>,
    );
    expect(screen.getByTestId("custom-progress")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<ProgressIndicator>Child content</ProgressIndicator>);
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
