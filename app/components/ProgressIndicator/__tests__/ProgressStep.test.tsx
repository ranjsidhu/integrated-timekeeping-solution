/** biome-ignore-all assist/source/organizeImports: Unit tests */
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
import { render, screen } from "@testing-library/react";

// Mock Carbon ProgressIndicator to avoid ESM import issues in Jest
jest.mock("@carbon/react", () => ({
  ProgressStep: (props: any) => (
    <div data-testid={props["data-testid"] ?? "progress-step"}>
      {props.children}
    </div>
  ),
}));

import ProgressStep from "../ProgressStep";

describe("ProgressStep component", () => {
  it("renders with default data-testid when none provided", () => {
    render(<ProgressStep label="Step 1" />);
    expect(screen.getByTestId("progress-step")).toBeInTheDocument();
  });

  it("renders with provided data-testid", () => {
    render(<ProgressStep label="Step 1" data-testid="custom-progress" />);
    expect(screen.getByTestId("custom-progress")).toBeInTheDocument();
  });
});
