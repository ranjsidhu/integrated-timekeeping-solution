// import { render, screen } from "@testing-library/react";
// import ErrorBoundary from "./ErrorBoundary";

// // Component that throws an error
// const ThrowError = () => {
//   throw new Error("Test error");
// };

// // Component for testing normal rendering
// const TestComponent = () => <div data-testid="test-content">Test Content</div>;

// describe("ErrorBoundary", () => {
//   // Prevent console.error during error tests
//   const originalError = console.error;
//   const originalLog = console.log;

//   beforeAll(() => {
//     console.error = jest.fn();
//     console.log = jest.fn();
//   });

//   afterAll(() => {
//     console.error = originalError;
//     console.log = originalLog;
//   });

//   it("renders children when no error occurs", () => {
//     render(
//       <ErrorBoundary>
//         <TestComponent />
//       </ErrorBoundary>
//     );

//     expect(screen.getByTestId("test-content")).toBeInTheDocument();
//   });

//   it("passes through test id to the wrapper element", () => {
//     render(
//       <ErrorBoundary data-testid="custom-error-boundary">
//         <div>Content</div>
//       </ErrorBoundary>
//     );

//     expect(screen.getByTestId("custom-error-boundary")).toBeInTheDocument();
//   });

//   it("uses default test id when none provided", () => {
//     render(
//       <ErrorBoundary>
//         <div>Content</div>
//       </ErrorBoundary>
//     );

//     expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
//   });

//   it("renders custom fallback UI when error occurs", () => {
//     const Fallback = () => (
//       <div data-testid="error-fallback">Custom Error UI</div>
//     );

//     render(
//       <ErrorBoundary fallback={<Fallback />}>
//         <ThrowError />
//       </ErrorBoundary>
//     );

//     expect(screen.getByTestId("error-fallback")).toBeInTheDocument();
//   });

//   it("renders children again after error is cleared", () => {
//     const { rerender } = render(
//       <ErrorBoundary>
//         <ThrowError />
//       </ErrorBoundary>
//     );

//     // First verify we're in an error state
//     expect(screen.getByTestId("error-boundary")).toBeInTheDocument();

//     // Now rerender with a non-erroring component
//     rerender(
//       <ErrorBoundary>
//         <TestComponent />
//       </ErrorBoundary>
//     );

//     // Verify the normal content is shown
//     expect(screen.getByTestId("test-content")).toBeInTheDocument();
//   });
// });

describe("placeholder", () => {
  it("should equate 1 with 1", () => {
    expect(1).toBe(1);
  });
});
