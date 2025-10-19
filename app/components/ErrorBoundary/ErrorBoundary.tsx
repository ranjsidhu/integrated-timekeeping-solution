"use client";

import { ErrorBoundary as CarbonErrorBoundary } from "@carbon/react";

type CarbonErrorBoundaryProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonErrorBoundary> & {
      "data-testid"?: string;
    }
  >
>;

export default function ErrorBoundary({ ...props }: CarbonErrorBoundaryProps) {
  const dataTestId = props["data-testid"] ?? "error-boundary";
  return (
    <CarbonErrorBoundary
      {...props}
      data-testid={dataTestId}
    ></CarbonErrorBoundary>
  );
}
