import type { LoginFormData } from "@/types/login.types";
import { validateForm } from "./login.utils";

describe("validateForm", () => {
  it("should return required errors when email and password are empty", () => {
    const data: LoginFormData = { email: "", password: "" };
    const errors = validateForm(data);

    expect(errors).toEqual({
      email: "IBMid or email is required",
      password: "Password is required",
    });
  });

  it("should treat whitespace-only email as empty", () => {
    const data: LoginFormData = {
      email: "   \t\n ",
      password: "validpassword",
    };
    const errors = validateForm(data);

    expect(errors).toEqual({ email: "IBMid or email is required" });
  });

  it("should return an error when password is shorter than 6 characters", () => {
    const data: LoginFormData = { email: "user@example.com", password: "abc" };
    const errors = validateForm(data);

    expect(errors).toEqual({
      password: "Password must be at least 6 characters",
    });
  });

  it("does not return password length error when password length is exactly 6", () => {
    const data: LoginFormData = {
      email: "user@example.com",
      password: "abcdef",
    };
    const errors = validateForm(data);

    expect(errors).toEqual({});
  });

  it("returns no errors for valid input", () => {
    const data: LoginFormData = {
      email: "alice@example.com",
      password: "supersecret",
    };
    const errors = validateForm(data);

    expect(errors).toEqual({});
  });

  it("returns an error for invalid email formats", () => {
    const data: LoginFormData = {
      email: "not-an-email",
      password: "supersecret",
    };
    const errors = validateForm(data);

    expect(errors).toEqual({
      email: "Enter a valid IBMid or email address",
    });
  });
});
