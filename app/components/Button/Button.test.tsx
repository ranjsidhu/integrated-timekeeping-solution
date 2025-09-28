import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders the button with the correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByTestId("button")).toHaveTextContent("Click me");
  });

  it("applies additional props correctly", () => {
    render(
      <Button data-testid="custom-button" disabled>
        Disabled
      </Button>,
    );
    const button = screen.getByTestId("custom-button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Disabled");
  });
});
