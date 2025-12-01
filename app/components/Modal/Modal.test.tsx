/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */

import { render, screen } from "@testing-library/react";

jest.mock("@carbon/react", () => {
  const React = require("react");
  return {
    Modal: (props: any) =>
      React.createElement(
        "div",
        { "data-testid": props["data-testid"] ?? "carbon-modal" },
        props.children,
      ),
  };
});

import Modal from "@/app/components/Modal/Modal";

describe("Modal component", () => {
  it("renders children and uses default data-testid when none provided", () => {
    render(<Modal>Test content</Modal>);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("uses provided data-testid and renders children", () => {
    render(<Modal data-testid="custom">Custom content</Modal>);

    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(screen.getByText("Custom content")).toBeInTheDocument();
  });
});
