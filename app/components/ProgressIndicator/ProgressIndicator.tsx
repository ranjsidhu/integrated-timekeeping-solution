import { ProgressIndicator as CarbonProgressIndicator } from "@carbon/react";

type CarbonProgressIndicatorProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonProgressIndicator> & {
      "data-testid"?: string;
    }
  >
>;

export default function ProgressIndicator({
  children,
  ...props
}: CarbonProgressIndicatorProps) {
  const dataTestId = props["data-testid"] ?? "progress-indicator";
  return (
    <CarbonProgressIndicator {...props} data-testid={dataTestId}>
      {children}
    </CarbonProgressIndicator>
  );
}
