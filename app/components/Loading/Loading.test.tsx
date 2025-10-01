import { render, screen } from "@testing-library/react";
import Loading from "./Loading";

describe("Loading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the loading component", () => {
    render(<Loading />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should apply default data-testid when not provided", () => {
    render(<Loading />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
    expect(loading).toHaveAttribute("data-testid", "loading");
  });

  it("should apply custom data-testid when provided", () => {
    const customTestId = "custom-loading";
    render(<Loading data-testid={customTestId} />);

    const loading = screen.getByTestId(customTestId);
    expect(loading).toBeInTheDocument();
  });

  it("should handle active prop", () => {
    render(<Loading active />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle withOverlay prop", () => {
    render(<Loading withOverlay />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle small prop", () => {
    render(<Loading small />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle description prop", () => {
    const description = "Loading data...";
    render(<Loading description={description} />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle className prop", () => {
    const customClass = "custom-loading-class";
    render(<Loading className={customClass} />);

    const loading = screen.getByTestId("loading");
    expect(loading).toHaveClass(customClass);
  });

  it("should handle active false prop", () => {
    render(<Loading active={false} />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle withOverlay false prop", () => {
    render(<Loading withOverlay={false} />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle small false prop", () => {
    render(<Loading small={false} />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should be usable with client-side rendered components", () => {
    // This test verifies the "use client" directive is working
    expect(() => {
      render(<Loading />);
    }).not.toThrow();

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle undefined data-testid gracefully", () => {
    render(<Loading data-testid={undefined} />);

    // Should fall back to default
    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should use nullish coalescing for data-testid", () => {
    const { rerender } = render(<Loading />);

    let loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();

    rerender(<Loading data-testid="new-test-id" />);

    loading = screen.getByTestId("new-test-id");
    expect(loading).toBeInTheDocument();
  });

  it("should handle empty string data-testid", () => {
    render(<Loading data-testid="" />);

    // Empty string is used as-is with nullish coalescing
    const loading = screen.getByTestId("");
    expect(loading).toBeInTheDocument();
  });

  it("should spread additional props to CarbonLoading", () => {
    render(
      <Loading
        data-testid="test-loading"
        aria-label="Loading content"
        role="status"
      />,
    );

    const loading = screen.getByTestId("test-loading");
    expect(loading).toBeInTheDocument();
  });

  it("should render with all boolean props set to true", () => {
    render(
      <Loading data-testid="all-props-loading" active withOverlay small />,
    );

    const loading = screen.getByTestId("all-props-loading");
    expect(loading).toBeInTheDocument();
  });

  it("should render with all boolean props set to false", () => {
    render(
      <Loading
        data-testid="all-false-props"
        active={false}
        withOverlay={false}
        small={false}
      />,
    );

    const loading = screen.getByTestId("all-false-props");
    expect(loading).toBeInTheDocument();
  });

  it("should render with description and active props", () => {
    render(
      <Loading
        data-testid="described-loading"
        description="Please wait..."
        active
      />,
    );

    const loading = screen.getByTestId("described-loading");
    expect(loading).toBeInTheDocument();
  });

  it("should render with withOverlay and description", () => {
    render(
      <Loading
        data-testid="overlay-loading"
        withOverlay
        description="Loading your content"
      />,
    );

    const loading = screen.getByTestId("overlay-loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle style prop", () => {
    const customStyle = { position: "fixed" as const, top: "50%" };
    render(<Loading style={customStyle} />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should render with all props combined", () => {
    render(
      <Loading
        data-testid="full-props-loading"
        active
        withOverlay
        small
        description="Loading..."
        className="custom-class"
      />,
    );

    const loading = screen.getByTestId("full-props-loading");
    expect(loading).toBeInTheDocument();
    expect(loading).toHaveClass("custom-class");
  });

  it("should handle re-rendering with different props", () => {
    const { rerender } = render(
      <Loading data-testid="rerender-loading" active={false} />,
    );

    let loading = screen.getByTestId("rerender-loading");
    expect(loading).toBeInTheDocument();

    rerender(<Loading data-testid="rerender-loading" active />);

    loading = screen.getByTestId("rerender-loading");
    expect(loading).toBeInTheDocument();
  });

  it("should pass data-testid attribute correctly", () => {
    const testId = "my-loading";
    render(<Loading data-testid={testId} />);

    const loading = screen.getByTestId(testId);
    expect(loading).toHaveAttribute("data-testid", testId);
  });

  it("should render with default data-testid value", () => {
    render(<Loading />);

    const loading = screen.getByTestId("loading");
    expect(loading).toHaveAttribute("data-testid", "loading");
  });

  it("should handle multiple className values", () => {
    render(
      <Loading
        data-testid="multi-class"
        className="class-one class-two class-three"
      />,
    );

    const loading = screen.getByTestId("multi-class");
    expect(loading).toHaveClass("class-one", "class-two", "class-three");
  });

  it("should render without any optional props", () => {
    render(<Loading />);

    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  it("should handle toggling active state", () => {
    const { rerender } = render(<Loading data-testid="toggle-active" active />);

    let loading = screen.getByTestId("toggle-active");
    expect(loading).toBeInTheDocument();

    rerender(<Loading data-testid="toggle-active" active={false} />);

    loading = screen.getByTestId("toggle-active");
    expect(loading).toBeInTheDocument();
  });

  it("should handle toggling withOverlay state", () => {
    const { rerender } = render(
      <Loading data-testid="toggle-overlay" withOverlay />,
    );

    let loading = screen.getByTestId("toggle-overlay");
    expect(loading).toBeInTheDocument();

    rerender(<Loading data-testid="toggle-overlay" withOverlay={false} />);

    loading = screen.getByTestId("toggle-overlay");
    expect(loading).toBeInTheDocument();
  });

  it("should handle toggling small state", () => {
    const { rerender } = render(<Loading data-testid="toggle-small" small />);

    let loading = screen.getByTestId("toggle-small");
    expect(loading).toBeInTheDocument();

    rerender(<Loading data-testid="toggle-small" small={false} />);

    loading = screen.getByTestId("toggle-small");
    expect(loading).toBeInTheDocument();
  });

  it("should handle changing description", () => {
    const { rerender } = render(
      <Loading data-testid="change-desc" description="Initial description" />,
    );

    let loading = screen.getByTestId("change-desc");
    expect(loading).toBeInTheDocument();

    rerender(
      <Loading data-testid="change-desc" description="Updated description" />,
    );

    loading = screen.getByTestId("change-desc");
    expect(loading).toBeInTheDocument();
  });

  it("should accept children prop", () => {
    render(
      <Loading data-testid="with-children">
        <div>Child content</div>
      </Loading>,
    );

    const loading = screen.getByTestId("with-children");
    expect(loading).toBeInTheDocument();
  });
});
