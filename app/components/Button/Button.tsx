"use client";

import { Button as CarbonButton } from "@carbon/react";

type CarbonButtonProps = Readonly<
  React.PropsWithChildren<React.ComponentProps<typeof CarbonButton>>
>;

export default function Button({ children, ...props }: CarbonButtonProps) {
  const dataTestId = props["data-testid"] ?? "button";
  return (
    <CarbonButton {...props} data-testid={dataTestId}>
      {children}
    </CarbonButton>
  );
}
