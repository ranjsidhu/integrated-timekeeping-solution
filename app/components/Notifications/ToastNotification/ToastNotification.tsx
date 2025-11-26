import { ToastNotification as CarbonToastNotification } from "@carbon/react";

type ToastNotificationProps = Readonly<
  React.ComponentProps<typeof CarbonToastNotification> & {
    "data-testid"?: string;
  }
>;

export default function ToastNotification({
  "data-testid": dataTestId,
  ...props
}: ToastNotificationProps) {
  const testId = dataTestId ?? "inline-notification";
  return <CarbonToastNotification {...props} data-testid={testId} />;
}
