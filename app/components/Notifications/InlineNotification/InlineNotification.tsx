import { InlineNotification as CarbonInlineNotification } from "@carbon/react";

type InlineNotificationProps = Readonly<
  React.ComponentProps<typeof CarbonInlineNotification> & {
    "data-testid"?: string;
  }
>;

export default function InlineNotification({
  "data-testid": dataTestId,
  ...props
}: InlineNotificationProps) {
  const testId = dataTestId ?? "inline-notification";
  return <CarbonInlineNotification {...props} data-testid={testId} />;
}
