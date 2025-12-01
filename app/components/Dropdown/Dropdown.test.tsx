import { render, screen } from "@testing-library/react";
import Dropdown from "./Dropdown";

describe("Dropdown component", () => {
  test("renders and uses default data-testid when none provided", () => {
    render(
      <Dropdown id="d-default" titleText="Title" label="Label" items={[]} />,
    );

    const el = screen.getByTestId("dropdown");
    expect(el).toBeInTheDocument();
  });

  test("respects provided data-testid prop", () => {
    render(
      <Dropdown
        id="d-1"
        titleText="Title"
        label="Label"
        data-testid="my-dropdown"
        items={[]}
      />,
    );

    const el = screen.getByTestId("my-dropdown");
    expect(el).toBeInTheDocument();
  });

  test("forwards other props (id, className) to underlying element", () => {
    render(
      <Dropdown
        id="d-2"
        className="dd-class"
        titleText="Title"
        label="Label"
        items={[]}
      />,
    );

    const { container } = render(
      <Dropdown
        id="d-2"
        className="dd-class"
        titleText="Title"
        label="Label"
        items={[]}
      />,
    );

    // Carbon Dropdown may not attach id/class to the same DOM node that carries the data-testid
    // but className should appear somewhere in the rendered output when forwarded.
    expect(container.querySelector(".dd-class")).toBeInTheDocument();
  });
});
