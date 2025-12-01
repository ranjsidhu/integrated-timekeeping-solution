jest.mock("@carbon/react", () => {
  const React = require("react");
  return {
    ToastNotification: (props: Record<string, unknown>) =>
      React.createElement("div", props),
  };
});

import { render, screen } from "@testing-library/react";
import ToastNotification from "./ToastNotification";

describe("ToastNotification", () => {
  it("renders with default data-testid when none provided", () => {
    render(<ToastNotification kind="success" title="OK" />);

    const el = screen.getByTestId("inline-notification");
    expect(el).toBeInTheDocument();
  });

  it("uses provided data-testid and forwards other props", () => {
    render(
      <ToastNotification
        data-testid="toast-test"
        data-custom="x"
        kind="info"
        title="Hello"
      />,
    );

    const el = screen.getByTestId("toast-test");
    expect(el).toBeInTheDocument();
    expect(el.getAttribute("data-custom")).toBe("x");
  });
});
