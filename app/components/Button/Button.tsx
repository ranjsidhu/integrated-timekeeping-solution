"use client";

import { Button as CarbonButton } from "@carbon/react";

export default function Button({
  children,
  ...props
}: Readonly<
  React.PropsWithChildren<React.ComponentProps<typeof CarbonButton>>
>) {
  return <CarbonButton {...props}>{children}</CarbonButton>;
}
