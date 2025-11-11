import { render, screen } from "@testing-library/react";
import Column from "./Column";

describe("Column component", () => {
  test("renders children and uses default data-testid when none provided", () => {
    render(
      <Column>
        <div>Hello Column</div>
      </Column>,
    );

    const el = screen.getByTestId("column");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Hello Column");
  });

  test("respects provided data-testid prop", () => {
    render(
      <Column data-testid="my-col">
        <span>Custom</span>
      </Column>,
    );

    const el = screen.getByTestId("my-col");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Custom");
  });

  test("forwards other props (id, className) to underlying element", () => {
    render(
      <Column id="col1" className="custom-class">
        <span>With props</span>
      </Column>,
    );

    const el = screen.getByTestId("column");
    expect(el).toHaveAttribute("id", "col1");
    // className may include other classes from the Carbon component; ensure ours is present
    expect(el.className).toEqual(expect.stringContaining("custom-class"));
  });
});
