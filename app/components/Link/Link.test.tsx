import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "./Link";

describe("Link", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render a link with children", () => {
    render(<Link href="/test">Test Link</Link>);

    const link = screen.getByRole("link", { name: "Test Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("Test Link");
  });

  it("should apply default data-testid when not provided", () => {
    render(<Link href="/test">Link Text</Link>);

    const link = screen.getByTestId("link");
    expect(link).toBeInTheDocument();
  });

  it("should apply custom data-testid when provided", () => {
    const customTestId = "custom-link";
    render(
      <Link href="/test" data-testid={customTestId}>
        Link Text
      </Link>,
    );

    const link = screen.getByTestId(customTestId);
    expect(link).toBeInTheDocument();
  });

  it("should handle href prop", () => {
    const href = "/about";
    render(<Link href={href}>About</Link>);

    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", href);
  });

  it("should handle external links with target blank", () => {
    render(
      <Link
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        External Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "External Link" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should handle onClick events", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(
      <Link href="/test" onClick={handleClick}>
        Clickable Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Clickable Link" });
    await user.click(link);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should handle disabled prop", () => {
    render(
      <Link href="/test" disabled>
        Disabled Link
      </Link>,
    );

    const link = screen.getByTestId("link");
    expect(link).toBeInTheDocument();
  });

  it("should handle className prop", () => {
    const customClass = "custom-link-class";
    render(
      <Link href="/test" className={customClass}>
        Styled Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Styled Link" });
    expect(link).toHaveClass(customClass);
  });

  it("should handle inline prop", () => {
    render(
      <Link href="/test" inline>
        Inline Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Inline Link" });
    expect(link).toBeInTheDocument();
  });

  it("should handle visited prop", () => {
    render(
      <Link href="/test" visited>
        Visited Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Visited Link" });
    expect(link).toBeInTheDocument();
  });

  it("should handle size prop", () => {
    render(
      <Link href="/test" size="lg">
        Large Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Large Link" });
    expect(link).toBeInTheDocument();
  });

  it("should render with complex children", () => {
    render(
      <Link href="/test">
        <span>Complex</span> <strong>Children</strong>
      </Link>,
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("Children")).toBeInTheDocument();
  });

  it("should render with icon children", () => {
    const Icon = () => (
      <svg data-testid="icon">
        <title>Icon</title>Icon
      </svg>
    );

    render(
      <Link href="/test">
        Link with Icon <Icon />
      </Link>,
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should handle multiple clicks", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(
      <Link href="/test" onClick={handleClick}>
        Multi-click Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Multi-click Link" });
    await user.click(link);
    await user.click(link);
    await user.click(link);

    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it("should be usable with client-side rendered components", () => {
    // This test verifies the "use client" directive is working
    expect(() => {
      render(<Link href="/test">Client Link</Link>);
    }).not.toThrow();

    const link = screen.getByRole("link", { name: "Client Link" });
    expect(link).toBeInTheDocument();
  });

  it("should handle undefined data-testid gracefully", () => {
    render(
      <Link href="/test" data-testid={undefined}>
        Link Text
      </Link>,
    );

    // Should fall back to default
    const link = screen.getByTestId("link");
    expect(link).toBeInTheDocument();
  });

  it("should use nullish coalescing for data-testid", () => {
    const { rerender } = render(<Link href="/test">Default Link</Link>);

    let link = screen.getByTestId("link");
    expect(link).toBeInTheDocument();

    rerender(
      <Link href="/test" data-testid="new-test-id">
        Updated Link
      </Link>,
    );

    link = screen.getByTestId("new-test-id");
    expect(link).toBeInTheDocument();
  });

  it("should handle empty string data-testid", () => {
    render(
      <Link href="/test" data-testid="">
        Empty TestId Link
      </Link>,
    );

    // Empty string is used as-is with nullish coalescing
    const link = screen.getByTestId("");
    expect(link).toBeInTheDocument();
  });

  it("should spread additional props to CarbonLink", () => {
    render(
      <Link
        href="/test"
        data-testid="test-link"
        aria-label="Test Link Label"
        role="link"
      >
        Props Link
      </Link>,
    );

    const link = screen.getByTestId("test-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("aria-label", "Test Link Label");
  });

  it("should support keyboard navigation", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(
      <Link href="/test" onClick={handleClick}>
        Keyboard Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Keyboard Link" });
    link.focus();

    expect(link).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalled();
  });

  it("should handle focus and blur events", () => {
    render(
      <Link href="/test" data-testid="focus-link">
        Focus Link
      </Link>,
    );

    const link = screen.getByTestId("focus-link");
    link.focus();

    expect(link).toHaveFocus();

    link.blur();
    expect(link).not.toHaveFocus();
  });

  it("should render with all props combined", () => {
    render(
      <Link
        href="https://example.com"
        data-testid="full-props-link"
        target="_blank"
        rel="noopener noreferrer"
        className="custom-class"
        inline
        visited
        size="lg"
      >
        Full Props Link
      </Link>,
    );

    const link = screen.getByTestId("full-props-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveClass("custom-class");
  });

  it("should handle re-rendering with different props", () => {
    const { rerender } = render(
      <Link href="/initial" data-testid="rerender-link">
        Initial Link
      </Link>,
    );

    let link = screen.getByTestId("rerender-link");
    expect(link).toHaveAttribute("href", "/initial");
    expect(link).toHaveTextContent("Initial Link");

    rerender(
      <Link href="/updated" data-testid="rerender-link">
        Updated Link
      </Link>,
    );

    link = screen.getByTestId("rerender-link");
    expect(link).toHaveAttribute("href", "/updated");
    expect(link).toHaveTextContent("Updated Link");
  });

  it("should pass data-testid attribute correctly", () => {
    const testId = "my-link";
    render(
      <Link href="/test" data-testid={testId}>
        Test Link
      </Link>,
    );

    const link = screen.getByTestId(testId);
    expect(link).toHaveAttribute("data-testid", testId);
  });

  it("should render with default data-testid value", () => {
    render(<Link href="/test">Default TestId</Link>);

    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("data-testid", "link");
  });

  it("should handle style prop", () => {
    const customStyle = { color: "blue", fontSize: "20px" };
    render(
      <Link href="/test" style={customStyle}>
        Styled Link
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Styled Link" });
    expect(link).toBeInTheDocument();
  });

  it("should require children prop", () => {
    // TypeScript ensures children is required, but we can test runtime behavior
    render(<Link href="/test">Required Children</Link>);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Required Children");
  });

  it("should handle string children", () => {
    render(<Link href="/test">Simple String</Link>);

    const link = screen.getByRole("link", { name: "Simple String" });
    expect(link).toHaveTextContent("Simple String");
  });

  it("should handle number children", () => {
    render(<Link href="/test">{123}</Link>);

    const link = screen.getByRole("link", { name: "123" });
    expect(link).toHaveTextContent("123");
  });

  it("should handle React element children", () => {
    render(
      <Link href="/test">
        <div>React Element Child</div>
      </Link>,
    );

    screen.getByRole("link");
    expect(screen.getByText("React Element Child")).toBeInTheDocument();
  });

  it("should handle array children", () => {
    render(<Link href="/test">{["First", " ", "Second"]}</Link>);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("First Second");
  });
});
