export type NotificationType = {
  kind:
    | "success"
    | "error"
    | "info"
    | "info-square"
    | "warning"
    | "warning-alt";
  title: string;
  subtitle?: string;
  caption?: string;
  timeout: number;
  type: "toast" | "inline";
};
