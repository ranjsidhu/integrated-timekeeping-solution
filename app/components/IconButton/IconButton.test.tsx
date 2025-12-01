import { render, screen } from "@testing-library/react";
import IconButton from "./IconButton";

describe("IconButton component", () => {
  test("renders children and uses default data-testid when none provided", () => {
    render(
      <IconButton label="btn">
        <span>Icon</span>
      </IconButton>,
    );

    const el = screen.getByTestId("icon-button");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Icon");
  });

  test("respects provided data-testid prop", () => {
    render(
      <IconButton label="btn" data-testid="my-icon-button">
        <span>Custom</span>
      </IconButton>,
    );

    const el = screen.getByTestId("my-icon-button");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Custom");
  });

  test("forwards other props (id, className) to underlying element", () => {
    render(
      <IconButton label="btn" id="ib1" className="ib-class">
        <span>With props</span>
      </IconButton>,
    );

    const el = screen.getByTestId("icon-button");
    expect(el).toHaveAttribute("id", "ib1");
    expect(el.className).toEqual(expect.stringContaining("ib-class"));
  });
});
