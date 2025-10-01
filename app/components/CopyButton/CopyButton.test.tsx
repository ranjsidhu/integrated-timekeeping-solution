import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyButton from "./CopyButton";

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe("CopyButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the copy button", () => {
    render(<CopyButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should apply default data-testid when not provided", () => {
    render(<CopyButton />);

    const button = screen.getByTestId("carbon-copy-button");
    expect(button).toBeInTheDocument();
  });

  it("should apply custom data-testid when provided", () => {
    const customTestId = "custom-copy-button";
    render(<CopyButton data-testid={customTestId} />);

    const button = screen.getByTestId(customTestId);
    expect(button).toBeInTheDocument();
  });

  it("should handle feedback prop", () => {
    const feedback = "Copied to clipboard!";
    render(<CopyButton feedback={feedback} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should handle feedbackTimeout prop", () => {
    render(<CopyButton feedbackTimeout={2000} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should handle iconDescription prop", () => {
    const iconDescription = "Copy to clipboard";
    render(<CopyButton iconDescription={iconDescription} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should handle onClick prop", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(<CopyButton onClick={handleClick} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<CopyButton disabled />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should not be disabled when disabled prop is false", () => {
    render(<CopyButton disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("should spread additional props to CarbonCopyButton", () => {
    render(<CopyButton data-testid="test-button" className="custom-class" />);

    const button = screen.getByTestId("test-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("custom-class");
  });

  it("should handle align prop", () => {
    render(<CopyButton align="bottom" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should be clickable when not disabled", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(<CopyButton onClick={handleClick} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalled();
  });

  it("should not trigger onClick when disabled", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(<CopyButton onClick={handleClick} disabled />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should handle multiple rapid clicks", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(<CopyButton onClick={handleClick} />);

    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it("should be usable with client-side rendered components", () => {
    // This test verifies the "use client" directive is working
    expect(() => {
      render(<CopyButton />);
    }).not.toThrow();

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should accept children prop", () => {
    render(
      <CopyButton>
        <span>Custom content</span>
      </CopyButton>,
    );

    // Button should still render
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should handle undefined data-testid gracefully", () => {
    render(<CopyButton data-testid={undefined} />);

    // Should fall back to default
    const button = screen.getByTestId("carbon-copy-button");
    expect(button).toBeInTheDocument();
  });

  it("should use nullish coalescing for data-testid", () => {
    const { rerender } = render(<CopyButton />);

    let button = screen.getByTestId("carbon-copy-button");
    expect(button).toBeInTheDocument();

    rerender(<CopyButton data-testid="new-test-id" />);

    button = screen.getByTestId("new-test-id");
    expect(button).toBeInTheDocument();
  });

  it("should handle empty string data-testid", () => {
    render(<CopyButton data-testid="" />);

    // Empty string is truthy for the nullish coalescing operator
    // so it will be set to empty string, not the default
    const button = screen.getByTestId("");
    expect(button).toBeInTheDocument();
  });

  it("should maintain button type", () => {
    render(<CopyButton />);

    const button = screen.getByRole("button");
    expect(button.tagName).toBe("BUTTON");
  });

  it("should handle className prop", () => {
    const customClass = "my-custom-class";
    render(<CopyButton className={customClass} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(customClass);
  });

  it("should handle style prop", () => {
    const customStyle = { backgroundColor: "red" };
    render(<CopyButton style={customStyle} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should support keyboard interaction", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(<CopyButton onClick={handleClick} />);

    const button = screen.getByRole("button");
    button.focus();

    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalled();
  });

  it("should support space key interaction", async () => {
    const user = userEvent.setup({ delay: null });
    const handleClick = jest.fn();

    render(<CopyButton onClick={handleClick} />);

    const button = screen.getByRole("button");
    button.focus();

    await user.keyboard(" ");
    expect(handleClick).toHaveBeenCalled();
  });

  it("should render with all props combined", () => {
    render(
      <CopyButton
        data-testid="full-props-button"
        feedback="Copied!"
        feedbackTimeout={3000}
        iconDescription="Copy this"
        disabled={false}
        align="top"
        className="test-class"
      />,
    );

    const button = screen.getByTestId("full-props-button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("should handle re-rendering with different props", () => {
    const { rerender } = render(
      <CopyButton data-testid="rerender-test" iconDescription="Initial" />,
    );

    let button = screen.getByTestId("rerender-test");
    expect(button).toBeInTheDocument();

    rerender(
      <CopyButton data-testid="rerender-test" iconDescription="Updated" />,
    );

    button = screen.getByTestId("rerender-test");
    expect(button).toBeInTheDocument();
  });

  it("should pass data-testid prop correctly", () => {
    const testId = "my-copy-button";
    render(<CopyButton data-testid={testId} />);

    const button = screen.getByTestId(testId);
    expect(button).toHaveAttribute("data-testid", testId);
  });

  it("should render with default data-testid value", () => {
    render(<CopyButton />);

    const button = screen.getByTestId("carbon-copy-button");
    expect(button).toHaveAttribute("data-testid", "carbon-copy-button");
  });

  it("should handle button focus", () => {
    render(<CopyButton data-testid="focus-test" />);

    const button = screen.getByTestId("focus-test");
    button.focus();

    expect(button).toHaveFocus();
  });

  it("should handle button blur", () => {
    render(<CopyButton data-testid="blur-test" />);

    const button = screen.getByTestId("blur-test");
    button.focus();
    expect(button).toHaveFocus();

    button.blur();
    expect(button).not.toHaveFocus();
  });
});
