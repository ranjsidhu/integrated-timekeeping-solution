"use client";

import { Form, InlineNotification } from "@carbon/react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Button, Input } from "@/app/components";
import type {
  FormErrors,
  LoginFormData,
  NotificationState,
} from "@/types/login.types";
import { validateForm } from "@/utils/login/login.utils";
import { login } from "./serveractions";

export default function LoginForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
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
      const response = await login(formData);
      if (!response.ok) {
        throw new Error(response.message || "Login failed");
      }

      setNotification({
        show: true,
        kind: "success",
        title: "Login Successful",
        subtitle: "Redirecting to dashboard...",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
    } catch (error) {
      setNotification({
        show: true,
        kind: "error",
        title: "Login Failed",
        subtitle:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  const handleNotificationClose = (): void => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return (
    <Form onSubmit={handleSubmit}>
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
          type="text"
          id="username"
          data-testid="username-input"
          labelText="Username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleInputChange}
          invalid={!!errors.username}
          invalidText={errors.username}
        />
      </div>

      <div className="mb-8">
        <Input
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
