"use client";

import { Checkbox as CarbonCheckbox } from "@carbon/react";

type CarbonButtonProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonCheckbox> & { "data-testid"?: string }
  >
>;

export default function Checkbox({ ...props }: CarbonButtonProps) {
  const dataTestId = props["data-testid"] ?? "checkbox";
  return <CarbonCheckbox {...props} data-testid={dataTestId} />;
}
