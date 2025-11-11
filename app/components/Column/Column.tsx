import { Column as CarbonColumn } from "@carbon/react";

type CarbonColumnProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonColumn> & { "data-testid"?: string }
  >
>;

export default function Column({ ...props }: CarbonColumnProps) {
  const dataTestId = props["data-testid"] ?? "column";
  return <CarbonColumn {...props} data-testid={dataTestId} />;
}
