"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  Button,
  Form,
  InlineNotification,
  Input,
  Loading,
} from "@/app/components";
import type {
  FormErrors,
  LoginFormData,
  NotificationState,
} from "@/types/login.types";
import { handleCredentialsSignIn } from "@/utils/auth/signIn";
import { validateForm } from "@/utils/login/login.utils";

export default function LoginForm() {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    kind: "success",
    title: "",
    subtitle: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const result = await handleCredentialsSignIn(formData);

      if (result.success) {
        // Update the session to ensure it's available on the client
        await update();
        // Navigate client-side after session is updated
        router.push("/timesheet");
      } else {
        setNotification({
          show: true,
          kind: "error",
          title: "Login Failed",
          subtitle: result.error || "Invalid username or password",
        });
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      setNotification({
        show: true,
        kind: "error",
        title: "Login Failed",
        subtitle: "An unexpected error occurred",
      });
      setLoading(false);
    }
  };

  const handleNotificationClose = (): void => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Loading active={loading} description="Signing in..." />
      {notification.show && (
        <div className="mb-6" data-testid="notification">
          <InlineNotification
            kind={notification.kind}
            title={notification.title}
            subtitle={notification.subtitle}
            onClose={handleNotificationClose}
            lowContrast
          />
        </div>
      )}
      <div className="mb-6">
        <Input
          autoComplete="email"
          type="text"
          id="email"
          data-testid="email-input"
          labelText="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          invalid={!!errors.email}
          invalidText={errors.email}
        />
      </div>

      <div className="mb-8">
        <Input
          autoComplete="password"
          type="password"
          id="password"
          data-testid="password-input"
          labelText="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          invalid={!!errors.password}
          invalidText={errors.password}
        />
      </div>

      <Button type="submit" kind="primary" size="lg" className="w-full">
        Sign In
      </Button>
    </Form>
  );
}
