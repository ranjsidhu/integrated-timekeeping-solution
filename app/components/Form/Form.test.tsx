import { render, screen } from "@testing-library/react";
import Form from "./Form";

describe("Form component", () => {
  it("renders children", () => {
    render(
      <Form>
        <div data-testid="child">Hello</div>
      </Form>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("uses default data-testid when not provided", () => {
    render(
      <Form>
        <span />
      </Form>,
    );

    expect(screen.getByTestId("form")).toBeInTheDocument();
  });

  it("respects custom data-testid prop", () => {
    render(
      <Form data-testid="my-form">
        <span />
      </Form>,
    );

    expect(screen.getByTestId("my-form")).toBeInTheDocument();
  });

  it("forwards arbitrary props (e.g., className)", () => {
    render(
      <Form className="custom-class">
        <span />
      </Form>,
    );

    const el = screen.getByTestId("form");
    expect(el).toHaveClass("custom-class");
  });
});
