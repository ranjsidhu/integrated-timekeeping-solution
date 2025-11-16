"use server";

import type { LoginFormData } from "@/types/login.types";
import { signIn } from "../../auth";

const handleCredentialsSignIn = async (formData: LoginFormData) => {
  await signIn("credentials", {
    email: formData.email,
    password: formData.password,
    redirectTo: "/timesheet",
  });
};

export { handleCredentialsSignIn };
