"use client";

import { Loading as CarbonLoading } from "@carbon/react";

type CarbonLoadingProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonLoading> & {
      "data-testid"?: string;
    }
  >
>;

export default function Loading({ ...props }: CarbonLoadingProps) {
  const dataTestId = props["data-testid"] ?? "loading";
  return <CarbonLoading {...props} data-testid={dataTestId} />;
}
