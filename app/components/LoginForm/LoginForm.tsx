"use client";

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
      await handleCredentialsSignIn(formData);
    } catch (error: unknown) {
      const castedError = error as Error;
      if (!castedError?.message?.includes("NEXT_REDIRECT")) {
        console.error("Login error:", castedError.message);
        setNotification({
          show: true,
          kind: "error",
          title: "Login Failed",
          subtitle: "Invalid username or password",
        });
      }
    } finally {
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
