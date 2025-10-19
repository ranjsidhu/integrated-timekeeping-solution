"use client";

import { CheckboxGroup as CarbonCheckboxGroup } from "@carbon/react";

type CarbonButtonProps = Readonly<
  React.PropsWithChildren<
    React.ComponentProps<typeof CarbonCheckboxGroup> & {
      "data-testid"?: string;
    }
  >
>;

export default function CheckboxGroup({ ...props }: CarbonButtonProps) {
  const dataTestId = props["data-testid"] ?? "checkbox-group";

  return <CarbonCheckboxGroup {...props} data-testid={dataTestId} />;
}
