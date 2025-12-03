import { ProgressStep as CarbonProgressStep } from "@carbon/react";

type CarbonProgressStepProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonProgressStep> & {
      "data-testid"?: string;
    }
  >
>;

export default function ProgressStep({
  children,
  ...props
}: CarbonProgressStepProps) {
  const dataTestId = props["data-testid"] ?? "progress-step";
  return <CarbonProgressStep {...props} data-testid={dataTestId} />;
}
