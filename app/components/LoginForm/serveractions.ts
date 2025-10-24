"use server";

import type { LoginFormData } from "@/types/login.types";

const login = async (formData: LoginFormData) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const parsedResponse = await response.json();
    return parsedResponse;
  } catch (error: unknown) {
    console.error("Login failed:", error);
    return { ok: false, message: (error as Error).message };
  }
};

export { login };
