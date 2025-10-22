/**
 * TypeScript type definitions for login components
 */

export interface LoginFormData {
  username: string;
  password: string;
}

export interface FormErrors {
  username?: string;
  password?: string;
  form?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: string;
    username: string;
    email?: string;
    role?: string;
  };
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginResponse["user"] | null;
  login: (credentials: LoginFormData) => Promise<LoginResponse>;
  logout: () => void;
}

export type NotificationKind =
  | "error"
  | "info"
  | "info-square"
  | "success"
  | "warning"
  | "warning-alt";

export interface NotificationState {
  show: boolean;
  kind: NotificationKind;
  title: string;
  subtitle: string;
}
