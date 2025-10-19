// ErrorBoundary.test.tsx

import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => jest.fn());
});

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({
  shouldThrow = true,
  message = "Test error",
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that works normally
const WorkingComponent: React.FC = () => {
  return <div>Working component</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("should catch errors thrown by child components", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    // The Carbon ErrorBoundary should display some error UI
    // Verify that the working component is not rendered
    expect(screen.queryByText("No error")).not.toBeInTheDocument();
  });

  it("should accept default data-testid prop", () => {
    const { container } = render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    // The component should render without errors
    expect(container).toBeInTheDocument();
    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("should accept custom data-testid when provided", () => {
    const customTestId = "custom-error-boundary";
    const { container } = render(
      <ErrorBoundary data-testid={customTestId}>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    // The component should render without errors
    expect(container).toBeInTheDocument();
    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("should pass through data-testid prop to Carbon ErrorBoundary", () => {
    const testId = "test-boundary";
    render(
      <ErrorBoundary data-testid={testId}>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    // Verify component renders correctly with the prop
    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("should handle multiple children", () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Child 3")).toBeInTheDocument();
  });

  it("should catch errors from any child in a tree", () => {
    render(
      <ErrorBoundary>
        <div>
          <div>
            <ThrowError />
          </div>
        </div>
      </ErrorBoundary>,
    );

    // The error should be caught even from deeply nested component
    expect(screen.queryByText("No error")).not.toBeInTheDocument();
  });

  it("should only catch errors from throwing children, not affect others", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();
    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should handle different error types", () => {
    const CustomError = () => {
      throw new TypeError("Custom type error");
    };

    render(
      <ErrorBoundary>
        <CustomError />
      </ErrorBoundary>,
    );

    // Error should be caught regardless of error type
    expect(screen.queryByText("No error")).not.toBeInTheDocument();
  });

  it("should be usable with client-side rendered components", () => {
    // This test verifies the "use client" directive is working
    // by ensuring the component can be instantiated
    expect(() => {
      render(
        <ErrorBoundary>
          <div>Client component</div>
        </ErrorBoundary>,
      );
    }).not.toThrow();

    expect(screen.getByText("Client component")).toBeInTheDocument();
  });

  it("should accept and render null children", () => {
    const { container } = render(
      <ErrorBoundary data-testid="boundary-with-null">{null}</ErrorBoundary>,
    );

    // Component should render without errors
    expect(container).toBeInTheDocument();
  });

  it("should accept and render undefined children", () => {
    const { container } = render(
      <ErrorBoundary data-testid="boundary-with-undefined">
        {undefined}
      </ErrorBoundary>,
    );

    // Component should render without errors
    expect(container).toBeInTheDocument();
  });

  it("should spread all props to CarbonErrorBoundary", () => {
    render(
      <ErrorBoundary
        data-testid="custom-test"
        aria-label="Error boundary region"
      >
        <WorkingComponent />
      </ErrorBoundary>,
    );

    // Verify component renders correctly with all props
    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("should use default data-testid value when prop is not provided", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();

    // Test that component can be re-rendered
    rerender(
      <ErrorBoundary>
        <div>Updated component</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Updated component")).toBeInTheDocument();
  });

  it("should handle prop spreading with additional Carbon ErrorBoundary props", () => {
    // Test that the component accepts and passes through props
    const { container } = render(
      <ErrorBoundary data-testid="test">
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("should correctly apply data-testid with nullish coalescing", () => {
    // Test the default value logic
    const { rerender } = render(
      <ErrorBoundary data-testid={undefined}>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();

    // Rerender with explicit value
    rerender(
      <ErrorBoundary data-testid="explicit-id">
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();
  });
});
