import { fireEvent, render, screen } from "@testing-library/react";

// Mock Carbon Search to a simple input so tests are deterministic
jest.mock("@carbon/react", () => {
  const React = require("react");
  return {
    Search: (props: Record<string, unknown>) =>
      React.createElement("input", props),
  };
});

import Search from "./Search";

describe("Search component", () => {
  it("renders with default data-testid when none provided", () => {
    render(<Search labelText="Search" />);
    const el = screen.getByTestId("search");
    expect(el).toBeInTheDocument();
    expect(el.tagName.toLowerCase()).toBe("input");
  });

  it("accepts a custom data-testid and forwards props", () => {
    render(
      <Search
        labelText="Search"
        data-testid="search-custom"
        placeholder="find"
      />,
    );
    const el = screen.getByTestId("search-custom") as HTMLInputElement;
    expect(el).toBeInTheDocument();
    expect(el.placeholder).toBe("find");
  });

  it("forwards onChange events", () => {
    const handle = jest.fn();
    render(<Search labelText="Search" data-testid="s1" onChange={handle} />);
    const el = screen.getByTestId("s1") as HTMLInputElement;
    fireEvent.change(el, { target: { value: "abc" } });
    expect(handle).toHaveBeenCalled();
    // verify event target value forwarded
    const evt = handle.mock.calls[0][0] as unknown as {
      target: { value: string };
    };
    expect(evt.target.value).toBe("abc");
  });
});
