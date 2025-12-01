import { render, screen } from "@testing-library/react";
import Grid from "./Grid";

describe("Grid component", () => {
  test("renders children and uses default data-testid when none provided", () => {
    render(
      <Grid>
        <div>Hello Grid</div>
      </Grid>,
    );

    const el = screen.getByTestId("grid");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Hello Grid");
  });

  test("respects provided data-testid prop", () => {
    render(
      <Grid data-testid="my-grid">
        <span>Custom</span>
      </Grid>,
    );

    const el = screen.getByTestId("my-grid");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Custom");
  });

  test("forwards other props (id, className) to underlying element", () => {
    render(
      <Grid id="g1" className="grid-class">
        <span>With props</span>
      </Grid>,
    );

    const el = screen.getByTestId("grid");
    expect(el).toHaveAttribute("id", "g1");
    expect(el.className).toEqual(expect.stringContaining("grid-class"));
  });
});
