import type { LoginFormData } from "@/types/login.types";
import { validateForm } from "./login.utils";

describe("validateForm", () => {
  it("should return required errors when username and password are empty", () => {
    const data: LoginFormData = { username: "", password: "" };
    const errors = validateForm(data);

    expect(errors).toEqual({
      username: "Username is required",
      password: "Password is required",
    });
  });

  it("should treat whitespace-only username as empty", () => {
    const data: LoginFormData = {
      username: "   \t\n ",
      password: "validpassword",
    };
    const errors = validateForm(data);

    expect(errors).toEqual({ username: "Username is required" });
  });

  it("should return an error when password is shorter than 6 characters", () => {
    const data: LoginFormData = { username: "user", password: "abc" };
    const errors = validateForm(data);

    expect(errors).toEqual({
      password: "Password must be at least 6 characters",
    });
  });

  it("does not return password length error when password length is exactly 6", () => {
    const data: LoginFormData = { username: "user", password: "abcdef" };
    const errors = validateForm(data);

    expect(errors).toEqual({});
  });

  it("returns no errors for valid input", () => {
    const data: LoginFormData = { username: "alice", password: "supersecret" };
    const errors = validateForm(data);

    expect(errors).toEqual({});
  });
});
