"use server";

import type { LoginFormData } from "@/types/login.types";
import { signIn } from "../../auth";

/**
 * Handles user sign-in with credentials.
 * @param formData - Login form data containing email and password
 * @returns Promise resolving when sign-in is complete
 */
const handleCredentialsSignIn = async (formData: LoginFormData) => {
  await signIn("credentials", {
    email: formData.email,
    password: formData.password,
    redirectTo: "/timesheet",
  });
};

export { handleCredentialsSignIn };
