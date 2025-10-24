import { fireEvent, render, screen } from "@testing-library/react";
import InlineNotification from "./InlineNotification";

describe("InlineNotification component", () => {
  it("uses default data-testid when not provided", () => {
    render(<InlineNotification title="Hi" subtitle="there" kind="success" />);
    expect(screen.getByTestId("inline-notification")).toBeInTheDocument();
  });

  it("respects custom data-testid prop", () => {
    render(
      <InlineNotification
        data-testid="my-notif"
        title="Hello"
        subtitle="world"
        kind="error"
      />,
    );

    expect(screen.getByTestId("my-notif")).toBeInTheDocument();
  });

  it("renders title and subtitle", () => {
    render(<InlineNotification title="Title" subtitle="Sub" kind="error" />);
    expect(screen.getByText(/Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Sub/i)).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = jest.fn();
    render(
      <InlineNotification
        title="T"
        subtitle="S"
        kind="error"
        onClose={onClose}
      />,
    );

    const notif = screen.getByTestId("inline-notification");
    const btn = notif.querySelector(
      "button[aria-label], button[aria-labelledby]",
    );
    if (!btn) throw new Error("Close button not found");
    fireEvent.click(btn);

    expect(onClose).toHaveBeenCalled();
  });
});
