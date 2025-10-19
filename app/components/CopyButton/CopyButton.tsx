"use client";

import { CopyButton as CarbonCopyButton } from "@carbon/react";

type CarbonCopyButtonProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonCopyButton> & { "data-testid"?: string }
  >
>;

export default function CopyButton({ ...props }: CarbonCopyButtonProps) {
  const dataTestId = props["data-testid"] ?? "carbon-copy-button";
  return <CarbonCopyButton {...props} data-testid={dataTestId} />;
}
