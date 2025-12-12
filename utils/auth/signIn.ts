"use server";

import type { LoginFormData } from "@/types/login.types";
import { signIn } from "../../auth";

/**
 * Handles user sign-in with credentials.
 * @param formData - Login form data containing email and password
 * @returns Promise resolving to success status
 */
const handleCredentialsSignIn = async (formData: LoginFormData) => {
  try {
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: "Invalid credentials" };
  }
};

export { handleCredentialsSignIn };
