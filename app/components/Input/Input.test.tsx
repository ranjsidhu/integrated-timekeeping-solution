import { render, screen } from "@testing-library/react";
import Input from "./Input";

describe("Input Component", () => {
  describe("NumberInput", () => {
    it("renders a number input with required props", () => {
      render(<Input type="number" id="test-number" label="Number Label" />);

      const input = screen.getByTestId("number-input");
      expect(input).toBeInTheDocument();
    });

    it("uses custom data-testid when provided", () => {
      render(
        <Input
          type="number"
          id="test-number"
          label="Number Label"
          data-testid="custom-number"
        />,
      );

      const input = screen.getByTestId("custom-number");
      expect(input).toBeInTheDocument();
    });

    it("passes through number-specific props", () => {
      render(
        <Input
          type="number"
          id="test-number"
          label="Number Label"
          min={0}
          max={100}
          step={5}
        />,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("min", "0");
      expect(input).toHaveAttribute("max", "100");
      expect(input).toHaveAttribute("step", "5");
    });

    it("renders with helper text", () => {
      render(
        <Input
          type="number"
          id="test-number"
          label="Number Label"
          helperText="Enter a number"
        />,
      );

      expect(screen.getByText("Enter a number")).toBeInTheDocument();
    });

    it("renders as disabled when disabled prop is true", () => {
      render(
        <Input type="number" id="test-number" label="Number Label" disabled />,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toBeDisabled();
    });
  });

  describe("PasswordInput", () => {
    it("renders a password input with required props", () => {
      render(
        <Input type="password" id="test-password" labelText="Password Label" />,
      );

      const input = screen.getByTestId("password-input");
      expect(input).toBeInTheDocument();
    });

    it("uses custom data-testid when provided", () => {
      render(
        <Input
          type="password"
          id="test-password"
          labelText="Password Label"
          data-testid="custom-password"
        />,
      );

      const input = screen.getByTestId("custom-password");
      expect(input).toBeInTheDocument();
    });

    it("renders password field with type password", () => {
      render(
        <Input type="password" id="test-password" labelText="Password Label" />,
      );

      const input = screen.getByLabelText("Password Label");
      expect(input).toHaveAttribute("type", "password");
    });

    it("renders with helper text", () => {
      render(
        <Input
          type="password"
          id="test-password"
          labelText="Password Label"
          helperText="Enter your password"
        />,
      );

      expect(screen.getByText("Enter your password")).toBeInTheDocument();
    });

    it("renders as disabled when disabled prop is true", () => {
      render(
        <Input
          type="password"
          id="test-password"
          labelText="Password Label"
          disabled
        />,
      );

      const input = screen.getByLabelText("Password Label");
      expect(input).toBeDisabled();
    });
  });

  describe("TextInput", () => {
    it("renders a text input with required props", () => {
      render(<Input type="text" id="test-text" labelText="Text Label" />);

      const input = screen.getByTestId("text-input");
      expect(input).toBeInTheDocument();
    });

    it("uses custom data-testid when provided", () => {
      render(
        <Input
          type="text"
          id="test-text"
          labelText="Text Label"
          data-testid="custom-text"
        />,
      );

      const input = screen.getByTestId("custom-text");
      expect(input).toBeInTheDocument();
    });

    it("renders text field with type text", () => {
      render(<Input type="text" id="test-text" labelText="Text Label" />);

      const input = screen.getByLabelText("Text Label");
      expect(input).toHaveAttribute("type", "text");
    });

    it("renders with placeholder", () => {
      render(
        <Input
          type="text"
          id="test-text"
          labelText="Text Label"
          placeholder="Enter text here"
        />,
      );

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(
        <Input
          type="text"
          id="test-text"
          labelText="Text Label"
          helperText="Enter some text"
        />,
      );

      expect(screen.getByText("Enter some text")).toBeInTheDocument();
    });

    it("renders as disabled when disabled prop is true", () => {
      render(
        <Input type="text" id="test-text" labelText="Text Label" disabled />,
      );

      const input = screen.getByLabelText("Text Label");
      expect(input).toBeDisabled();
    });

    it("renders with default value", () => {
      render(
        <Input
          type="text"
          id="test-text"
          labelText="Text Label"
          defaultValue="Default text"
        />,
      );

      const input = screen.getByDisplayValue("Default text");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Common Behavior", () => {
    it("applies custom className to number input", () => {
      const { container } = render(
        <Input
          type="number"
          id="test-number"
          label="Number Label"
          className="custom-class"
        />,
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("applies custom className to password input", () => {
      const { container } = render(
        <Input
          type="password"
          id="test-password"
          labelText="Password Label"
          className="custom-class"
        />,
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("applies custom className to text input", () => {
      const { container } = render(
        <Input
          type="text"
          id="test-text"
          labelText="Text Label"
          className="custom-class"
        />,
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });
});
