import { render, screen } from "@testing-library/react";
import Tag from "./Tag";

describe("Tag component", () => {
  test("renders children and uses default data-testid when none provided", () => {
    render(
      <Tag>
        <div>Example Tag</div>
      </Tag>,
    );

    const el = screen.getByTestId("tag");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Example Tag");
  });

  test("respects provided data-testid prop", () => {
    render(
      <Tag data-testid="my-tag">
        <span>Custom</span>
      </Tag>,
    );

    const el = screen.getByTestId("my-tag");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Custom");
  });

  test("forwards other props (id, className) to underlying element", () => {
    render(
      <Tag id="t1" className="tag-class">
        <span>With props</span>
      </Tag>,
    );

    const el = screen.getByTestId("tag");
    expect(el).toHaveAttribute("id", "t1");
    expect(el.className).toEqual(expect.stringContaining("tag-class"));
  });
});
