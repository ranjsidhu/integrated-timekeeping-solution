import type { FormErrors, LoginFormData } from "@/types/login.types";

const validateForm = (formData: LoginFormData): FormErrors => {
  const newErrors: FormErrors = {};

  if (!formData.username.trim()) {
    newErrors.username = "Username is required";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  return newErrors;
};

export { validateForm };
