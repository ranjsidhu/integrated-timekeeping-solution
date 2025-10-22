"use client";

import { Form, InlineNotification } from "@carbon/react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Button, Input } from "@/app/components";
import type {
  FormErrors,
  LoginFormData,
  NotificationState,
} from "@/types/login.types";

const LoginPageFixed: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log("Login attempted with:", formData);

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #161616 0%, #393939 100%)",
        padding: "2rem",
        margin: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "450px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              marginBottom: "0.5rem",
              fontSize: "2rem",
              fontWeight: "600",
              color: "#161616",
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#525252",
              marginTop: "0.5rem",
            }}
          >
            Sign in to your Integrated Timekeeping account
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div style={{ marginBottom: "1.5rem" }}>
            <InlineNotification
              kind={notification.kind}
              title={notification.title}
              subtitle={notification.subtitle}
              hideCloseButton={false}
              onClose={handleNotificationClose}
              lowContrast
            />
          </div>
        )}

        {/* Login Form */}
        <Form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <Input
              type="text"
              id="username"
              labelText="Username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              invalid={!!errors.username}
              invalidText={errors.username}
              required
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <Input
              type="password"
              id="password"
              labelText="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              invalid={!!errors.password}
              invalidText={errors.password}
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              fontSize: "0.875rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                color: "#525252",
              }}
            >
              <input
                type="checkbox"
                style={{ marginRight: "0.5rem" }}
                aria-label="Remember me"
              />
              Remember me
            </label>

            <a
              href="#forgot-password"
              style={{
                color: "#0f62fe",
                textDecoration: "none",
              }}
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            kind="primary"
            size="lg"
            style={{ width: "100%" }}
          >
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginPageFixed;
