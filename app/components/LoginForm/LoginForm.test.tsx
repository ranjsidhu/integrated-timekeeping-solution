/** biome-ignore-all assist/source/organizeImports: Unit tests */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginForm from "./LoginForm";

jest.mock("@/utils/auth/signIn", () => ({
  handleCredentialsSignIn: jest.fn(),
}));

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
    update: jest.fn(),
  })),
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
}));

// Mock Header to avoid importing ESM modules (@carbon/react, next-auth)
jest.mock("../Header/Header", () => {
  return () => (
    <header>
      <a href="/">Integrated Timekeeping</a>
      <span>IBM</span>
    </header>
  );
});

import { handleCredentialsSignIn } from "@/utils/auth/signIn";
import { useSession } from "next-auth/react";

describe("LoginForm", () => {
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockUpdate.mockClear();
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: mockUpdate,
    });
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

  it("calls handleCredentialsSignIn with credentials and redirects on success", async () => {
    // simulate a successful sign-in
    (handleCredentialsSignIn as jest.Mock).mockResolvedValue({ success: true });

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

    // should update session and redirect
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/timesheet");
      expect(mockRefresh).toHaveBeenCalled();
    });

    // no error notification should be shown for a successful signIn
    expect(screen.queryByTestId("notification")).toBeNull();
    expect(screen.queryByText(/Login Failed/i)).toBeNull();
  });

  it("shows error notification when signIn returns failure", async () => {
    (handleCredentialsSignIn as jest.Mock).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "eve@gmail.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(handleCredentialsSignIn).toHaveBeenCalledWith({
        email: "eve@gmail.com",
        password: "wrongpass",
      }),
    );

    // should show error notification
    expect(await screen.findByText(/Login Failed/i)).toBeInTheDocument();
    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  it("shows error notification when signIn throws an unexpected error", async () => {
    (handleCredentialsSignIn as jest.Mock).mockRejectedValue(
      new Error("Network error"),
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
      await screen.findByText(/An unexpected error occurred/i),
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
