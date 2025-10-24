import { act, fireEvent, render, screen } from "@testing-library/react";
import LoginForm from "./LoginForm";

jest.mock("./serveractions", () => ({
  login: jest.fn(),
}));

import { login } from "./serveractions";

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders inputs and submit button", () => {
    render(<LoginForm />);

    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("updates input values when typing", () => {
    render(<LoginForm />);

    const email = screen.getByTestId("email-input") as HTMLInputElement;
    const password = screen.getByTestId("password-input") as HTMLInputElement;

    fireEvent.change(email, { target: { value: "alice" } });
    fireEvent.change(password, { target: { value: "supersecret" } });

    expect(email).toHaveValue("alice");
    expect(password).toHaveValue("supersecret");
  });

  it("shows validation errors when submitting empty fields", () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
  });

  it("clears field error when the input value changes", () => {
    render(<LoginForm />);

    // Trigger validation errors by submitting empty form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Change email input -> should clear the email error
    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "alice" },
    });

    // email error should be removed
    expect(screen.queryByText(/email is required/i)).toBeNull();
  });

  it("shows success notification when login succeeds", async () => {
    (login as jest.Mock).mockResolvedValue({ ok: true });

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "supersecret" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Await the notification which is shown after the async submit flow
    expect(await screen.findByText(/Login Successful/i)).toBeInTheDocument();
  });

  it("shows error notification when login responds with ok:false", async () => {
    (login as jest.Mock).mockResolvedValue({
      ok: false,
      message: "Bad credentials",
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "bob" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/Login Failed/i)).toBeInTheDocument();
    expect(await screen.findByText(/Bad credentials/i)).toBeInTheDocument();
  });

  it("closes the notification when onClose is called", async () => {
    (login as jest.Mock).mockResolvedValue({ ok: true });

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "supersecret" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Wait for notification to appear
    expect(await screen.findByText(/Login Successful/i)).toBeInTheDocument();

    // Click the close button inside the InlineNotification (find the notification wrapper first)
    const notif = screen.getByTestId("notification");
    const closeBtn = notif.querySelector(
      "button[aria-label], button[aria-labelledby]",
    );
    if (!closeBtn) throw new Error("close button not found");

    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Login Successful/i)).toBeNull();
  });

  it("hides notification after timeout when timers advance", async () => {
    jest.useFakeTimers();
    try {
      (login as jest.Mock).mockResolvedValue({ ok: true });

      render(<LoginForm />);

      fireEvent.change(screen.getByTestId("email-input"), {
        target: { value: "alice" },
      });
      fireEvent.change(screen.getByTestId("password-input"), {
        target: { value: "supersecret" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      // Wait for the notification to appear
      expect(await screen.findByText(/Login Successful/i)).toBeInTheDocument();

      // Advance timers to trigger the setTimeout callback inside the component
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.queryByText(/Login Successful/i)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("calls login on successful login", () => {
    (login as jest.Mock).mockImplementation(() => ({ ok: true }));

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "supersecret" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({
      email: "alice",
      password: "supersecret",
    });
  });

  it("calls login and handles failure", () => {
    (login as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid credentials");
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "bob" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({
      email: "bob",
      password: "wrongpass",
    });
  });
});
