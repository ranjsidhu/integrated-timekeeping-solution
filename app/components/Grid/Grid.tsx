import { Grid as CarbonGrid } from "@carbon/react";

type CarbonGridProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonGrid> & { "data-testid"?: string }
  >
>;

export default function Grid({ children, ...props }: CarbonGridProps) {
  const dataTestId = props["data-testid"] ?? "grid";
  return (
    <CarbonGrid {...props} data-testid={dataTestId}>
      {children}
    </CarbonGrid>
  );
}
