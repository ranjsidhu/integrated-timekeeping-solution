import type { FormErrors, LoginFormData } from "@/types/login.types";

/**
 * Validates the login form data.
 * @param formData - The login form data to validate
 * @returns FormErrors object containing validation errors
 */
const validateForm = (formData: LoginFormData): FormErrors => {
  const newErrors: FormErrors = {};

  const email = formData.email || "";

  if (!email.trim()) {
    newErrors.email = "IBMid or email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      newErrors.email = "Enter a valid IBMid or email address";
    }
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  return newErrors;
};

export { validateForm };
