import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginForm from "./LoginForm";

jest.mock("@/utils/auth/signIn", () => ({
  handleCredentialsSignIn: jest.fn(),
}));

import { handleCredentialsSignIn } from "@/utils/auth/signIn";

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

    const email = screen.getByTestId("email-input");
    const password = screen.getByTestId("password-input");

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

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "alice" },
    });

    expect(screen.queryByText(/email is required/i)).toBeNull();
  });

  it("calls handleCredentialsSignIn with credentials and does not show notification on resolved promise", async () => {
    // simulate a successful resolved promise (no notification is set on success)
    (handleCredentialsSignIn as jest.Mock).mockResolvedValue(undefined);

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "alice@gmail.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "supersecret" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(handleCredentialsSignIn).toHaveBeenCalledWith({
        email: "alice@gmail.com",
        password: "supersecret",
      }),
    );

    // no error notification should be shown for a resolved signIn
    expect(screen.queryByTestId("notification")).toBeNull();
    expect(screen.queryByText(/Login Failed/i)).toBeNull();
  });

  it("does not show error notification when signIn triggers NEXT_REDIRECT", async () => {
    // next-auth may redirect by throwing an error that includes NEXT_REDIRECT;
    // LoginForm treats that as a non-error case (does not show a notification)
    (handleCredentialsSignIn as jest.Mock).mockRejectedValue(
      new Error("NEXT_REDIRECT: redirecting to /dashboard"),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "eve@gmail.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(handleCredentialsSignIn).toHaveBeenCalledWith({
        email: "eve@gmail.com",
        password: "secret",
      }),
    );

    // ensure the NEXT_REDIRECT path does not surface a user notification
    expect(screen.queryByTestId("notification")).toBeNull();
    expect(screen.queryByText(/Login Failed/i)).toBeNull();
  });

  it("shows error notification when signIn throws a non-redirect error", async () => {
    (handleCredentialsSignIn as jest.Mock).mockRejectedValue(
      new Error("Invalid credentials"),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "bob@gmail.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(handleCredentialsSignIn).toHaveBeenCalledWith({
        email: "bob@gmail.com",
        password: "wrongpass",
      }),
    );

    expect(await screen.findByText(/Login Failed/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Invalid username or password/i),
    ).toBeInTheDocument();

    // close the notification and ensure it is removed
    const wrapper = screen.getByTestId("notification");
    const closeBtn = wrapper.querySelector(
      "button[aria-label], button[aria-labelledby]",
    );
    expect(closeBtn).toBeTruthy();
    if (closeBtn) fireEvent.click(closeBtn);

    await waitFor(() =>
      expect(screen.queryByTestId("notification")).toBeNull(),
    );
  });
});
